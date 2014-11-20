Meteor.methods({
  upvoteComment: function (comment) {
    var user = Meteor.user();
    var userId = user._id;
    var commentId = comment._id;

    if (!comment)
      throw new Meteor.Error('invalid-content', 'This content does not exist.');

    if (!user || !canUpvote(user, comment))
      throw new Meteor.Error('duplicate-content', 'This content already exists.');

    // in case user is upvoting a previously downvoted comment, cancel downvote first
    // cancelDownvote(collection, comment, user);

    // votes/score
    var result = Comments.update({ '_id': commentId, 'upvoters': { $ne: userId } }, {
      $addToSet: { 'upvoters': userId },
      $inc: { 'upvotes': 1 }
    });

    if (!!result) {
      // add comment to list of user's upvoted items
      Meteor.users.update(userId, { $addToSet: { 'activity.upvotedComments': commentId } });

      // if the comment is upvoted by owner, don't modify reputation
      if (comment.userId !== userId) 
        Meteor.users.update(userId, { $inc: { 'stats.reputation': 1 } });
    }
  },
  cancelUpvoteComment: function (comment) {
    var user = Meteor.user();
    var userId = user._id;
    var commentId = comment._id;

    // if user isn't among the upvoters, abort
    if (!comment || !user || canUpvote(user, comment))
      throw new Meteor.Error('invalid-content', 'This content does not exist.');

    // votes/score
    var result = Comments.update({ '_id': commentId, 'upvoters': userId } }, {
      $pull: { 'upvoters': userId },
      $inc: { 'upvotes': -1 }
    });

    if (!!result) {
      // Remove item from list of upvoted items
      Meteor.users.update(userId, { $pull: { 'activity.upvotedComments': commentId } });

      // if the item is upvoted by owner, don't modify reputation
      if (comment.userId !== userId) 
        Meteor.users.update(userId, { $inc: { 'stats.reputation': -1 } });
    }
  },
  vote: function (topic, side) {
    var user = Meteor.user();
    var userId = user._id;
    var topicId = topic._id;

    if (!topic || !user || !canUpvote(user))
      throw new Meteor.Error('invalid-content', 'This content does not exist.');

    // in case user voted already, cancel previous vote
    if (topic.proUsers && _.contains(topic.proUsers, userId))
      var field = 'pro';
    else if (topic.conUsers && _.contains(topic.conUsers, userId))
      var field = 'con';

    if (field) {
      Topics.update({ _id: topicId }, {
        $pull: { field + 'Users': userId },
        $inc: { field: -1 }
      });  
    }

    Topics.update({ _id: topicId }, {
      $addToSet: { side + 'Users': userId },
      $inc: { side: 1 }
    });

    // store voting history in user activity ?
  }
});