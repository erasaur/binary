Accounts.onCreateUser(function (options, user) {
  var userProperties = {
    profile: options.profile || {},
    stats: {
    	reputation: 0,
	    topicCount: 0,
	    commentCount: 0,
	    // isInvited: false,
	    // invitedCount: 0,
    },
    activity: { // activity involving other users/collections
    	upvotedComments: [],
			followers: [], 
			followingUsers: [], 
			followingTopics: [], 
			discussedTopics: []
    },
    notifications: {
    	replies: [], // replies to our comments
    	comments: [], // comments in our topics
    	followers: [],
    	followingUsers: { // users we are following
    		comments: [], // new comments
    		topics: [] // new topics
    	}, 
    	followingTopics: { // topics we are following
    		comments: []
    	}
    }
  };
  user = _.extend(user, userProperties);

  if (options.email)
    user.profile.email = options.email;
  
  // set notifications default preferences
  user.profile.notifications = {
  	enabled: true,
    followingUsers: { // users we are following
    	comments: true, // new comments
    	topics: true // new topics
    },
    followingTopics: { // topics we are following
    	comments: true // new comments
    },
    replies: true, // replies to our comments
    comments: true, // comments in our topics
    followers: true // new followers
  };

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
				"password": password
			});
			return "Success! Your account '" + username + "' has been created.";
		}
	},
	newTopic: function (topic) {
		var title = topic.title;
		var description = topic.description;
		var userId = this.userId;

		if (!title)
			throw new Meteor.Error(602, "Please enter a title.");

		// check if title already exists
		else {
			var topicWithTitle = Topics.find({"title": title});

			if (typeof topicWithTitle !== "undefined")
				throw new Meteor.Error(603, "Sorry, there is already a topic with that title.", topicWithTitle._id);
		}
		
		// if(!isAdmin(Meteor.user())){
  //     // check that user waits more than X seconds between posts
  //     if(!this.isSimulation && timeSinceLastPost < postInterval)
  //       throw new Meteor.Error(604, i18n.t('Please wait ')+(postInterval-timeSinceLastPost)+i18n.t(' seconds before posting again'));

  //     // check that the user doesn't post more than Y posts per day
  //     if(!this.isSimulation && numberOfPostsInPast24Hours > maxPostsPer24Hours)
  //       throw new Meteor.Error(605, i18n.t('Sorry, you cannot submit more than ')+maxPostsPer24Hours+i18n.t(' posts per day'));
  //   }

    var properties = {
      title: title,
      description: description,
      userId: userId,
      createdAt: new Date(),
      // author: getDisplayNameById(userId),
      // category: category,
      // baseScore: 0,
      // score: 0,
      // commentsCount: 0,
      pro: 0,
      con: 0,
      proUsers: [],
      conUsers: [],
      followers: []
    };

		var topicId = Topics.insert(properties);

		Meteor.call("newNotification", "newTopic", userId, { "topicId": topicId, "topicTitle": title });

		return topicId;
	},
	newComment: function(userId, topicId, content, side, replyTo, replyToUser) {
		if (content) {
			Meteor.users.update(userId, {$addToSet: {"activity.discussedTopics": topicId}});
			var commentId = Comments.insert({"userId": userId, 
																			 "topicId": topicId, 
																			 "createdAt": new Date(), 
																			 "content": content, 
																			 "side": side, 
																			 "upvotes": 0, 
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
		// var	name = getDisplayNameById(userId);

		// if (type === "newComment") {
		// 	var topicTitle = Topics.findOne(options.topicId).title;
		// 	var	notobj = {"url": "/topics/" + options.topicId + "#" + options.commentId, 
		// 								"message": name + " replied to your comment in '" + topicTitle + "'", 
		// 								"read": false};
		// 	var	notif;

		// 	//"user replied to your comment"
		// 	if (options.replyTo && options.replyTo !== userId) { //if reply to self, no notification
		// 		notif = Meteor.users.findOne(options.replyTo).notifications;

		// 		if (notif.commentReply.length >= 5) {
		// 			Meteor.users.update(options.replyTo, 
		// 												 {$pop: {"notifications.commentReply": -1}}); //pop the last item of array
		// 		}

		// 		Meteor.users.update(options.replyTo, 
		// 											 {$addToSet: {"notifications.commentReply": notobj}});
		// 	}

		// 	//"user has posted a new comment in topic"
		// 	var followers = Meteor.users.findOne(userId).activity.followers; 
		// 	notobj.message = name + " posted a new comment in '" + topicTitle + "'";

		// 	//notify poster's followers of his new comment
		// 	_.each(followers, function (id) {
		// 		if(id !== options.replyTo) { //if it's not the replyTo user (whom we should've already notified)
		// 			Meteor.users.update(id, {$addToSet: {"notifications.followingUser": notobj}});
		// 		}
		// 	});

		// 	var topicFollowers = [];
		// 	Meteor.users.find({"activity.followingTopics": options.topicId}).forEach(function (user) {
		// 		if(user._id !== options.replyTo && user._id !== userId) {
		// 			topicFollowers.push(user._id);
		// 		}
		// 	});

		// 	notobj.url = "/topics/" + options.topicId;
		// 	notobj.message = "A new comment was posted in '" + topicTitle + "'";
			
		// 	// notify people who are following the topic in which there is the new comment, 
		// 	// but not if they have already been notified via the user whom they are following
		// 	_.each(_.difference(topicFollowers, followers), function (id) {
		// 		// "a new comment has been posted in topic"
		// 		var currUrl = "/topics/" + options.topicId; //url for this notification

		// 		// check if a notification entry already has this url
		// 		notif = _.find(Meteor.users.findOne(id).notifications.followingTopic, function (obj) { 
		// 			return obj.url === currUrl; 
		// 		}); 

		// 		//if this topic already has more than one notification entry with the url, combine them all into one with a "count" 
		// 		if(notif) { //if this topic already has one entry
		// 			if(notif.count) {
		// 				Meteor.users.update({"_id": id, "notifications.followingTopic": {$elemMatch: {"url": currUrl}}}, 
		// 													  {$inc: {"notifications.followingTopic.$.count": 1}});
		// 			} else {
		// 				notobj.count = 2;
		// 				notobj.message = " new comments were posted in '" + topicTitle + "'";
		// 				Meteor.users.update(id, {$pull: {"notifications.followingTopic": {"url": currUrl}}});
		// 				Meteor.users.update(id, {$push: {"notifications.followingTopic": notobj}});	
		// 			}
		// 		} 
		// 		//"count" is still low, so just add it as usual, as a normal notification entry
		// 		else
		// 			Meteor.users.update(id, {$addToSet: {"notifications.followingTopic": notobj}});
		// 	});
		// } else if (type === "newTopic") {
		// 	_.each(Meteor.users.findOne(userId).activity.followers, function (id) {
		// 		Meteor.users.update(id, {$addToSet: {"notifications.followingUser": 
		// 			{"url": "/topics/" + options.topicId, "message": name + " created the new topic '" + options.topicTitle + "'"}}});
		// 	});
		// }
	},
	newFollower: function (userId, following) {
		Meteor.users.update(userId, {$addToSet: {"activity.followingUsers": following}});
		Meteor.users.update(following, {$addToSet: {"activity.followers": userId}});
	},
	removeFollower: function (userId, following) {
		Meteor.users.update(userId, {$pull: {"activity.followingUsers": following}});
		Meteor.users.update(following, {$pull: {"activity.followers": userId}});
	},
	upvoteComment: function (userId, commentId, commentOwner) {
		Comments.update(commentId, {$inc: {"upvotes": 1}});
		Meteor.users.update(commentOwner, {$inc: {"reputation": 1}});
		Meteor.users.update(userId, {$addToSet: {"activity.upvotedComments": commentId}});
	},
	downvoteComment: function (userId, commentId, commentOwner) {
		Comments.update(commentId, {$inc: {"upvotes": -1}});
		Meteor.users.update(commentOwner, {$inc: {"reputation": -1}});	
		Meteor.users.update(userId, {$pull: {"activity.upvotedComments": commentId}});
	},
	followTopic: function (userId, topicId) {
		Topics.update(topicId, {$addToSet: {"followers": userId}});
		Meteor.users.update(userId, {$addToSet: {"activity.followingTopics": topicId}});
	},
	unfollowTopic: function (userId, topicId) {
		Topics.update(topicId, {$pull: {"followers": userId}});
		Meteor.users.update(userId, {$pull: {"activity.followingTopics": topicId}});
	}
});











