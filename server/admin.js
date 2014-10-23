Meteor.methods({
  removeComment: function (comment) {
    if (!isAdmin(Meteor.user()))
      throw new Meteor.Error('no-permission', 'This user does not have permission to continue.');

    var commentId = comment._id;
    var topicId = comment.topicId;
    var userId = comment.userId;
    var upvotes = comment.upvotes;
    var upvoters = comment.upvoters;

    Topics.update(topicId, {
      $inc: { 'commentsCount': -1 }
    });
    Comments.update(commentId, { 
      $set: { 'isDeleted': true, 'content': 'Sorry, this comment has been deleted.' } 
    });
    Meteor.users.update(userId, { 
      $inc: { 'stats.commentsCount': -1, 'stats.reputation': -upvotes }, 
      $pull: { 'activity.discussedTopics': topicId }
    });
    Meteor.users.update(upvoters, {
      $pull: { 'activity.upvotedComments': commentId }
    }, { multi: true });
  },
  removeTopic: function (topic) {
    if (!isAdmin(Meteor.user()))
      throw new Meteor.Error('no-permission', 'This user does not have permission to continue.');

    var topicId = topic._id;
    var userId = topic.userId;

    Topics.update(topicId, {
      $set: { title: 'This topic has been deleted.', description: 'This topic has been deleted.', isDeleted: true }
    });

    // remove topic from users following
    Meteor.users.update({ '_id': { $in: topic.followers } }, {
      $pull: { 'activity.followingTopics': topicId }
    }, { multi: true });

    // remove topic from users discussed
    Meteor.users.update({ '_id': { $in: topic.commenters } }, {
      $pull: { 'activity.discussedTopics': topicId }
    }, { multi: true });

    // subtract comments count for users ?
  }
});