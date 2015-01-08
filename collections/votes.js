Meteor.methods({
  upvoteComment: function (comment) {
    check(comment, Match.ObjectIncluding({
      _id: String,
      userId: String,
      upvotes: Number
    }));

    var user = Meteor.user();
    var userId = user._id;
    var commentId = comment._id;

    if (!user || !canUpvote(user, comment))
      throw new Meteor.Error('duplicate-content', 'This content already exists.');

    // in case user is upvoting a previously downvoted comment, cancel downvote first
    // cancelDownvote(collection, comment, user);

    // votes/score
    comment.upvotes++;
    var score = getCommentScore(comment);
    var result = Comments.update({ '_id': commentId, 'upvoters': { $ne: userId } }, {
      $addToSet: { 'upvoters': userId },
      $inc: { 'upvotes': 1 },
      $set: { 'score': score }
    });

    if (!!result) {
      // add comment to list of user's upvoted items
      Meteor.users.update(userId, { $addToSet: { 'activity.upvotedComments': commentId } });

      // if the comment is upvoted by owner, don't modify reputation
      if (comment.userId !== userId)
        Meteor.users.update(comment.userId, { $inc: { 'stats.reputation': 1 } });
    }
  },
  cancelUpvoteComment: function (comment) {
    check(comment, Match.ObjectIncluding({
      _id: String,
      userId: String,
      upvotes: Number
    }));

    var user = Meteor.user();
    var userId = this.userId;
    var commentId = comment._id;

    // if user isn't among the upvoters, abort
    if (!user || canUpvote(user, comment))
      throw new Meteor.Error('invalid-content', 'This content does not exist.');

    // votes/score
    comment.upvotes--;
    var score = getCommentScore(comment);
    var result = Comments.update({ '_id': commentId, 'upvoters': userId }, {
      $pull: { 'upvoters': userId },
      $inc: { 'upvotes': -1 },
      $set: { 'score': score }
    });

    if (!!result) {
      // Remove item from list of upvoted items
      Meteor.users.update(userId, { $pull: { 'activity.upvotedComments': commentId } });

      // if the item is upvoted by owner, don't modify reputation
      if (comment.userId !== userId)
        Meteor.users.update(comment.userId, { $inc: { 'stats.reputation': -1 } });
    }
  },
  vote: function (topic, side) {
    check(topic, Match.ObjectIncluding({
      _id: String,
      proUsers: [String],
      conUsers: [String]
    }));
    check(side, String);

    var user = Meteor.user();
    var userId = this.userId;
    var topicId = topic._id;

    if (!user || !canUpvote(user))
      throw new Meteor.Error('invalid-content', 'This content already exists.');

    // in case user voted already, cancel previous vote
    if (_.contains(topic.proUsers, userId))
      var field = 'pro';
    else if (_.contains(topic.conUsers, userId))
      var field = 'con';

    if (field) {
      Topics.update(topicId, {
        $pull: setProperty({}, field + 'Users', userId),
        $inc: setProperty({}, field, -1) // need the function to convert variable key
      });

      // just cancelling vote, not switching. so don't revote after cancel
      if (field === side) return;
    }

    Topics.update(topicId, {
      $addToSet: setProperty({}, side + 'Users', userId),
      $inc: setProperty({}, side, 1)
    });

    // store voting history in user activity ?
  }
});

