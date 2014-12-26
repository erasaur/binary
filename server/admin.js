Meteor.methods({
  removeComment: function (comment) {
    check(comment, Match.ObjectIncluding({
      _id: String,
      topicId: String,
      userId: String,
      upvotes: Match.Integer,
      upvoters: [String]
    }));

    if (!isAdmin(Meteor.user()))
      throw new Meteor.Error('no-permission', 'This user does not have permission to continue.');

    var commentId = comment._id;
    var topicId = comment.topicId;
    var userId = comment.userId;
    var upvotes = comment.upvotes;
    var upvoters = comment.upvoters;

    // subtract comment count from topic
    Topics.update(topicId, { $inc: { 'commentsCount': -1 } });

    // mark comment as deleted
    Comments.update(commentId, {
      $set: {
        'isDeleted': true,
        'upvotes': 0,
        'content': i18n.t('comment_deleted')
      }
    });
    // subtract comments count and reputation
    Meteor.users.update(userId, {
      $inc: { 'stats.commentsCount': -1, 'stats.reputation': -upvotes },
      $pull: { 'activity.discussedTopics': topicId }
    });
    // remove comment from users upvotedComments
    Meteor.users.update(upvoters, {
      $pull: { 'activity.upvotedComments': commentId }
    }, { multi: true });
  },
  removeTopic: function (topic) {
    check(topic, Match.ObjectIncluding({
      _id: String,
      userId: String,
      followers: [String],
      commenters: [String]
    }));

    if (!isAdmin(Meteor.user()))
      throw new Meteor.Error('no-permission', 'This user does not have permission to continue.');

    var topicId = topic._id;
    var userId = topic.userId;

    var commentIds = [];
    var commenters = {}; // all users related to the topic comments (creators, upvoters, etc)
    var opts = { // the fields that could be changed
      'commentsCount': 0,
      'reputation': 0,
      'upvotedComments': []
    };

    Comments.find({ 'topicId': topicId }).forEach(function (comment) {
      commenters[comment.userId] = commenters[comment.userId] || opts;
      commenters[comment.userId].commentsCount++;
      commenters[comment.userId].reputation += comment.upvotes;

      _.each(comment.upvoters, function (upvoter) {
        commenters[upvoter] = commenters[upvoter] || opts;
        commenters[upvoter].upvotedComments.push(comment._id);
      });

      commentIds.push(comment._id);
    });

    var commenterIds = _.keys(commenters);
    _.each(commenterIds, function (commenterId) {
      var commenter = commenters[commenterId];
      // subtract comments count & reputation, remove upvoted comments
      Meteor.users.update({ '_id': commenterId }, {
        $inc: {
          'stats.commentsCount': -commenter.commentsCount,
          'stats.reputation': -commenter.reputation
        },
        $pullAll: { 'activity.upvotedComments': commenter.upvotedComments }
      });
    });

    Comments.remove({ '_id': { $in: commentIds } });

    // remove topic from users following
    Meteor.users.update({ '_id': { $in: topic.followers } }, {
      $pull: { 'activity.followingTopics': topicId }
    }, { multi: true });

    // remove topic from users discussed
    Meteor.users.update({ '_id': { $in: topic.commenters } }, {
      $pull: { 'activity.discussedTopics': topicId }
    }, { multi: true });

    // subtract topics count for creator
    Meteor.users.update(userId, { $inc: { 'stats.topicsCount': -1 } });

    // delete the topic
    Topics.remove(topicId);
  }
});
