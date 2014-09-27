function validEmail(email) {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email); 
}

Accounts.onCreateUser(function (options, user) {
	user.profile = options.profile;
	user.activity = options.activity;
	user.notifications = options.notifications;

	return user;
});

Accounts.validateNewUser(function (user) {
	var error;
	var username = user.username;
	var	email = user.email;
	var	password = user.password;

	if (username && email && password) {
		if (username.length < 3)
			error = "Username must be 3 characters or longer.";
		else if (!validEmail(email))
			error = "Did you mis-type your email?";
		else if(password.length < 6)
			error = "Your password must be at least 6 characters long."; 
	} else //fields not filled in
		error = "Please fill in all of the fields.";
	
	if(!error) return true;
	throw new Meteor.Error(403, error);
});

Meteor.methods({
	newUser: function (username, email, password) {		
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
									 "topics": []
									}, 
			"notifications": {"commentReply": [], "followingUser": [], "followingTopic": []}
		}, function (error) {
			if (!error)
				return "Success! Your account '" + username + "' has been created.";
		});
	},
	newTopic: function(title, userid, owner) {
		var errors = [];

		//enter the date as well
		if(title) {
			if(Topics.find({"title": title}).count() > 0) {
				errors.push("There is already a question with that title.");
			}
		} else {
			errors.push("Please fill in all of the fields!");
		}

		if(errors.length > 0) {
			throw new Meteor.Error(403, errors[0]);
		} else {
			var topic = Topics.insert({"title": title, 
																"owner": owner, 
																"date": new Date(), 
																"pro": 0, "con": 0, 
																"proUsers": [], 
																"conUsers": [], 
																"followers": []});

			Meteor.call("newNotification", "newTopic", owner, {"topicID": topic, "topic": title});

			return "Success! Your topic has been created.";
		}
	},
	newComment: function(userid, owner, topic, content, side, replyTo, replyToUser) {
		if(content) {
			Meteor.users.update({"_id": userid}, {$addToSet: {"activity.topics": topic}});
			var result = Comments.insert({"owner": owner, 
																	 "topic": topic, 
																	 "date": new Date(), 
																	 "content": content, 
																	 "side": side, 
																	 "likes": 0, 
																	 "replyTo": replyTo, 
																	 "replies": []});
			var r = replyToUser && Meteor.users.findOne({"username": replyToUser})._id || "";
			Meteor.call("newNotification", "newComment", userid, {"replyTo": r, "comment": result, "topic": topic});

			return result;
		} else {
			throw new Meteor.Error(403, "Sorry, you can't make a comment with no content.");
		}
	},
	newNotification: function(type, user, options) {
		if(type === "newComment") {
			var topic = Topics.findOne({"_id": options.topic}).title;
			var	username = Meteor.users.findOne(user).username;
			var	notobj = {"url": "/topics/" + options.topic + "#" + options.comment, 
										"message": username + " replied to your comment in '" + topic + "'", 
										"read": false};
			var	notif;

			//"user replied to your comment"
			if(options.replyTo && options.replyTo !== user) { //if some guy replies to himself, no notification
				notif = Meteor.users.findOne(options.replyTo).notifications;

				if(notif.commentReply.length >= 5) {
					Meteor.users.update({"_id": options.replyTo}, {$pop: {"notifications.commentReply": -1}}); //pop the last item of array
				}
				Meteor.users.update({"_id": options.replyTo}, {$addToSet: {"notifications.commentReply": notobj}});
			}

			//"user has posted a new comment in topic"
			var followers = Meteor.users.findOne(user).activity.followers; 
			notobj.message = username + " posted a new comment in '" + topic + "'";

			//notify poster's followers of his new comment
			_.each(followers, function(id) {
				if(id !== options.replyTo) { //if it's not the replyTo user (whom we should've already notified)
					Meteor.users.update({"_id": id}, {$addToSet: {"notifications.followingUser": notobj}});
				}
			});

			var topicFollowers = [];
			Meteor.users.find({"activity.followingTopics": options.topic}).forEach(function(u) {
				if(u._id !== options.replyTo && u._id !== user) {
					topicFollowers.push(u._id);
				}
			});

			notobj.url = "/topics/" + options.topic;
			notobj.message = "A new comment was posted in '" + topic + "'";
			//notify people who are following the topic in which there is the new comment, but not if they have already been notified via the user whom they are following
			_.each(_.difference(topicFollowers, followers), function(id) {
				//"a new comment has been posted in topic"
				var currUrl = "/topics/" + options.topic; //url for this notification
				notif = _.find(Meteor.users.findOne(id).notifications.followingTopic, function(obj){ return obj.url === currUrl; }); //see if a notification entry already has this url


				//if this topic already has more than one notification entry with the url, combine them all into one with a "count" 
				if(notif) { //if this topic already has one entry
					if(notif.count) {
						Meteor.users.update({"_id": id, "notifications.followingTopic": {$elemMatch: {"url": currUrl}}}, {$inc: {"notifications.followingTopic.$.count": 1}});
					} else {
						notobj.count = 2;
						notobj.message = " new comments were posted in '" + topic + "'";
						Meteor.users.update({"_id": id}, {$pull: {"notifications.followingTopic": {"url": "/topics/" + options.topic}}});
						Meteor.users.update({"_id": id}, {$push: {"notifications.followingTopic": notobj}});	
					}
				} 
				//"count" is still low, so just add it as usual, as a normal notification entry
				else {
					Meteor.users.update({"_id": id}, {$addToSet: {"notifications.followingTopic": notobj}});
				}
			});
		} else if(type === "newTopic") {
			_.each(Meteor.users.findOne({"username": user}).activity.followers, function(id) {
				Meteor.users.update({"_id": id}, {$addToSet: {"notifications.followingUser": {"url": "/topics/" + options.topicID, "message": user + " created the new topic '" + options.topic + "'"}}});
			});
		}
	},
	newFollower: function(user, following) {
		Meteor.users.update({"_id": user}, {$addToSet: {"activity.following": following}});
		Meteor.users.update({"_id": following}, {$addToSet: {"activity.followers": user}});
	},
	removeFollower: function(user, following) {
		Meteor.users.update({"_id": user}, {$pull: {"activity.following": following}});
		Meteor.users.update({"_id": following}, {$pull: {"activity.followers": user}});
	},
	likeComment: function(user, comment, owner) {
		Comments.update({"_id": comment}, {$inc: {"likes": 1}});
		Meteor.users.update({"_id": Meteor.users.findOne({"username": owner})._id}, {$inc: {"activity.likes": 1}});
		Meteor.users.update({"_id": user}, {$addToSet: {"activity.liked": comment}});
	},
	unlikeComment: function(user, comment, owner) {
		var owner = Meteor.users.findOne({"username": owner});
		Comments.update({"_id": comment}, {$inc: {"likes": -1}});
		if(owner.activity.likes > 0) {
			Meteor.users.update({"_id": owner._id}, {$inc: {"activity.likes": -1}});	
		}
		Meteor.users.update({"_id": user}, {$pull: {"activity.liked": comment}});
	},
	followTopic: function(user, topic) {
		Topics.update({"_id": topic}, {$addToSet: {"followers": user}});
		Meteor.users.update({"_id": user}, {$addToSet: {"activity.followingTopics": topic}});
	},
	unfollowTopic: function(user, topic) {
		Topics.update({"_id": topic}, {$pull: {"followers": user}});
		Meteor.users.update({"_id": user}, {$pull: {"activity.followingTopics": topic}});
	}
});