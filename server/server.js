Meteor.methods({
	newTopic: function (topic) {
		var title = topic.title;
		var description = topic.description;
		var userId = this.userId;

		if (!title)
			throw new Meteor.Error(602, "Please enter a title.");

		// check if title already exists
		else {
			var topicWithTitle = Topics.find({ "title": title });

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

		Meteor.users.update(userId, { $inc: { "stats.topicsCount": 1 } });
		Meteor.call("newNotification", "newTopic", userId, { "topicId": topicId, "topicTitle": title });

		return topicId;
	},
	newComment: function(userId, topicId, content, side, replyTo, replyToUser) {
		if (content) {
			Meteor.users.update(userId, { $addToSet: { "activity.discussedTopics": topicId } });

			var properties = {
				userId: userId,
				topicId: topicId,
				createdAt: new Date(),
				content: content,
				side: side,
				upvotes: 0,
				replyTo: replyTo,
				replies: []
			};

			var commentId = Comments.insert(properties);

			if (!!replyTo)
				Comments.update(replyTo, { $addToSet: { "replies": commentId } });

			Meteor.users.update(userId, { $inc: { "stats.commentsCount": 1 } });
			Meteor.call("newNotification", "newComment", userId, 
									{ "replyTo": replyToUser || "", "commentId": commentId, "topicId": topicId });

			return commentId;
		} else
			throw new Meteor.Error(403, "Sorry, you can't make a comment with no content.");
	},
	newFollower: function (userId, following) {
		Meteor.users.update(userId, { $addToSet: { "activity.followingUsers": following } });
		Meteor.users.update(following, { $addToSet: { "activity.followers": userId } });
	},
	removeFollower: function (userId, following) {
		Meteor.users.update(userId, { $pull: { "activity.followingUsers": following } });
		Meteor.users.update(following, { $pull: { "activity.followers": userId } });
	},
	upvoteComment: function (userId, commentId, commentOwner) {
		Comments.update(commentId, { $inc: { "upvotes": 1 } });
		Meteor.users.update(commentOwner, { $inc: { "reputation": 1 } });
		Meteor.users.update(userId, { $addToSet: { "activity.upvotedComments": commentId } });
	},
	downvoteComment: function (userId, commentId, commentOwner) {
		Comments.update(commentId, { $inc: { "upvotes": -1 } });
		Meteor.users.update(commentOwner, { $inc: {"reputation": -1 } });	
		Meteor.users.update(userId, { $pull: { "activity.upvotedComments": commentId } });
	},
	followTopic: function (userId, topicId) {
		Topics.update(topicId, { $addToSet: { "followers": userId } });
		Meteor.users.update(userId, { $addToSet: { "activity.followingTopics": topicId } });
	},
	unfollowTopic: function (userId, topicId) {
		Topics.update(topicId, { $pull: { "followers": userId } });
		Meteor.users.update(userId, { $pull: { "activity.followingTopics": topicId } });
	}
});











