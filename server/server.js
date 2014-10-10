Meteor.methods({
	newComment: function(topicId, content, side, replyTo, replyToUser) {
		if (content) {
      var userId = this.userId;

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
	newFollower: function (following) {
    var userId = this.userId;
		Meteor.users.update(userId, { $addToSet: { 'activity.followingUsers': following } });
		Meteor.users.update(following, { 
      $addToSet: { 'activity.followers': userId },
      $inc: { 'stats.followersCount': 1 } 
    });
	},
	removeFollower: function (following) {
    var userId = this.userId;
		Meteor.users.update(userId, { $pull: { 'activity.followingUsers': following } });
		Meteor.users.update(following, { 
      $pull: { 'activity.followers': userId },
      $inc: { 'stats.followersCount': -1 } 
    });
	},
	upvoteComment: function (commentId, ownerId) {
    var userId = this.userId;
		Comments.update(commentId, { $inc: { "upvotes": 1 } });
		Meteor.users.update(ownerId, { $inc: { "stats.reputation": 1 } });
		Meteor.users.update(userId, { $addToSet: { "activity.upvotedComments": commentId } });
	},
	downvoteComment: function (commentId, ownerId) {
    var userId = this.userId;
		Comments.update(commentId, { $inc: { "upvotes": -1 } });
		Meteor.users.update(ownerId, { $inc: { "stats.reputation": -1 } });	
		Meteor.users.update(userId, { $pull: { "activity.upvotedComments": commentId } });
	},
	followTopic: function (topicId) {
    var userId = this.userId;
		Topics.update(topicId, { $addToSet: { "followers": userId } });
		Meteor.users.update(userId, { $addToSet: { "activity.followingTopics": topicId } });
	},
	unfollowTopic: function (topicId) {
    var userId = this.userId;
		Topics.update(topicId, { $pull: { "followers": userId } });
		Meteor.users.update(userId, { $pull: { "activity.followingTopics": topicId } });
	}
});











