Accounts.onCreateUser(function (options, user) {
	user.profile = options.profile;
	user.activity = options.activity;
	user.notifications = options.notifications;

	return user;
});

Meteor.methods({
	newUser: function (username, email, password) {		
		var error;
		
		if(password.length < 6) {
			error = "Your password must be at least 6 characters long."; 
		}

		if(!!error)
			throw new Meteor.Error(403, error);
		else {
			Accounts.createUser({
				"username": username, 
				"email": email, 
				"password": password, 
				"profile": {}, 
				"activity": {"likes": 0, 
										 "liked": [], 
										 "followers": [], 
										 "following": [], 
										 "followingTopics": [], 
										 "discussedTopics": []
										}, 
				"notifications": {"commentReply": [], "followingUser": [], "followingTopic": []}
			});
			return "Success! Your account '" + username + "' has been created.";
		}
	},
	newTopic: function(userId, title) {
		var errors = [];

		//enter the date as well
		if (title) {
			if(Topics.find({"title": title}).count() > 0) {
				errors.push("There is already a question with that title.");
			}
		} else {
			errors.push("Please fill in all of the fields!");
		}

		if (errors.length > 0) {
			throw new Meteor.Error(403, errors[0]);
		} else {
			var topicId = Topics.insert({"title": title, 
																   "userId": userId, 
																   "createdAt": new Date(), 
																   "pro": 0, "con": 0, 
																   "proUsers": [], 
																   "conUsers": [], 
																   "followers": []
																  });

			Meteor.call("newNotification", "newTopic", userId, { "topicId": topicId, "topicTitle": title });

			return topicId;
		}
	},
	newComment: function(userId, topicId, content, side, replyTo, replyToUser) {
		if (content) {
			Meteor.users.update(userId, {$addToSet: {"activity.discussedTopics": topicId}});
			var commentId = Comments.insert({"userId": userId, 
																			 "topicId": topicId, 
																			 "createdAt": new Date(), 
																			 "content": content, 
																			 "side": side, 
																			 "likes": 0, 
																			 "replyTo": replyTo, 
																			 "replies": []
																			});
			if (replyTo)
				Comments.update(replyTo, { $addToSet: { "replies": commentId } });

			Meteor.call("newNotification", "newComment", userId, 
									{"replyTo": replyToUser || "", "commentId": commentId, "topicId": topicId});

			return commentId;
		} else {
			throw new Meteor.Error(403, "Sorry, you can't make a comment with no content.");
		}
	},
	newNotification: function(type, userId, options) {
		var	name = getDisplayNameById(userId);

		if (type === "newComment") {
			var topicTitle = Topics.findOne(options.topicId).title;
			var	notobj = {"url": "/topics/" + options.topicId + "#" + options.commentId, 
										"message": name + " replied to your comment in '" + topicTitle + "'", 
										"read": false};
			var	notif;

			//"user replied to your comment"
			if (options.replyTo && options.replyTo !== userId) { //if reply to self, no notification
				notif = Meteor.users.findOne(options.replyTo).notifications;

				if (notif.commentReply.length >= 5) {
					Meteor.users.update(options.replyTo, 
														 {$pop: {"notifications.commentReply": -1}}); //pop the last item of array
				}

				Meteor.users.update(options.replyTo, 
													 {$addToSet: {"notifications.commentReply": notobj}});
			}

			//"user has posted a new comment in topic"
			var followers = Meteor.users.findOne(userId).activity.followers; 
			notobj.message = name + " posted a new comment in '" + topicTitle + "'";

			//notify poster's followers of his new comment
			_.each(followers, function (id) {
				if(id !== options.replyTo) { //if it's not the replyTo user (whom we should've already notified)
					Meteor.users.update(id, {$addToSet: {"notifications.followingUser": notobj}});
				}
			});

			var topicFollowers = [];
			Meteor.users.find({"activity.followingTopics": options.topicId}).forEach(function (user) {
				if(user._id !== options.replyTo && user._id !== userId) {
					topicFollowers.push(user._id);
				}
			});

			notobj.url = "/topics/" + options.topicId;
			notobj.message = "A new comment was posted in '" + topicTitle + "'";
			
			// notify people who are following the topic in which there is the new comment, 
			// but not if they have already been notified via the user whom they are following
			_.each(_.difference(topicFollowers, followers), function (id) {
				// "a new comment has been posted in topic"
				var currUrl = "/topics/" + options.topicId; //url for this notification

				// check if a notification entry already has this url
				notif = _.find(Meteor.users.findOne(id).notifications.followingTopic, function (obj) { 
					return obj.url === currUrl; 
				}); 

				//if this topic already has more than one notification entry with the url, combine them all into one with a "count" 
				if(notif) { //if this topic already has one entry
					if(notif.count) {
						Meteor.users.update({"_id": id, "notifications.followingTopic": {$elemMatch: {"url": currUrl}}}, 
															  {$inc: {"notifications.followingTopic.$.count": 1}});
					} else {
						notobj.count = 2;
						notobj.message = " new comments were posted in '" + topicTitle + "'";
						Meteor.users.update(id, {$pull: {"notifications.followingTopic": {"url": currUrl}}});
						Meteor.users.update(id, {$push: {"notifications.followingTopic": notobj}});	
					}
				} 
				//"count" is still low, so just add it as usual, as a normal notification entry
				else
					Meteor.users.update(id, {$addToSet: {"notifications.followingTopic": notobj}});
			});
		} else if (type === "newTopic") {
			_.each(Meteor.users.findOne(userId).activity.followers, function (id) {
				Meteor.users.update(id, {$addToSet: {"notifications.followingUser": 
					{"url": "/topics/" + options.topicId, "message": name + " created the new topic '" + options.topicTitle + "'"}}});
			});
		}
	},
	newFollower: function(userId, following) {
		Meteor.users.update(userId, {$addToSet: {"activity.following": following}});
		Meteor.users.update(following, {$addToSet: {"activity.followers": userId}});
	},
	removeFollower: function(userId, following) {
		Meteor.users.update(userId, {$pull: {"activity.following": following}});
		Meteor.users.update(following, {$pull: {"activity.followers": userId}});
	},
	likeComment: function(userId, commentId, commentOwner) {
		Comments.update(commentId, {$inc: {"likes": 1}});
		Meteor.users.update(commentOwner, {$inc: {"activity.likes": 1}});
		Meteor.users.update(userId, {$addToSet: {"activity.liked": commentId}});
	},
	unlikeComment: function(userId, commentId, commentOwner) {
		Comments.update(commentId, {$inc: {"likes": -1}});

		Meteor.users.update(commentOwner, {$inc: {"activity.likes": -1}});	
		Meteor.users.update(userId, {$pull: {"activity.liked": commentId}});
	},
	followTopic: function(userId, topicId) {
		Topics.update(topicId, {$addToSet: {"followers": userId}});
		Meteor.users.update(userId, {$addToSet: {"activity.followingTopics": topicId}});
	},
	unfollowTopic: function(userId, topicId) {
		Topics.update(topicId, {$pull: {"followers": userId}});
		Meteor.users.update(userId, {$pull: {"activity.followingTopics": topicId}});
	}
});











