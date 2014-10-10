Meteor.methods({
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











