// topic-specific voting -----------------------------

var hasVotedTopic = function (topic, user) {
  return topic.proUsers && topic.proUsers.indexOf(user._id) > -1 ||
    topic.conUsers && topic.conUsers.indexOf(user._id) > -1;
};

var voteTopic = function (topic, side) {
  var user = Meteor.user();

  if (!user || !canUpvote(user) || !topic)
    return false;

  // in case user voted already, cancel previous vote
  cancelPreviousVote(topic, user);

  var result = Topics.update({ _id: topic._id }, {
    $addToSet: setProperty({}, side + 'Users', user._id),
    $inc: setProperty({}, side, 1)
  });

  // store voting history in user activity ?

  return true;
};

var cancelPreviousVote = function (topic, user) {
  if (!hasVotedTopic(topic, user))
    return false;

  var field;

  if (topic.proUsers.indexOf(user._id) > -1)
    field = 'pro';
  else if (topic.conUsers.indexOf(user._id) > -1)
    field = 'con';

  Topics.update({ _id: topic && topic._id }, {
    $pull: setProperty({}, field + 'Users', user._id),
    $inc: setProperty({}, field, -1)
  });

  // store voting history in user activity ?
};

// end topic-specific voting -------------------------


// general upvoting/downvoting -----------------------

var hasUpvotedItem = function (item, user) {
  return item.upvoters && item.upvoters.indexOf(user._id) > -1;
};

var addVote = function (userId, itemId, collection) {
  var field = 'activity.upvoted' + collection;
  var add = setProperty({}, field, itemId);
  Meteor.users.update(userId, { $addToSet: add });
};

var removeVote = function (userId, itemId, collection) {
  var field = 'activity.upvoted' + collection;
  var remove = setProperty({}, field, itemId);
  Meteor.users.update(userId, { $pull: remove });
};

var upvoteItem = function (collection, item) {
  var user = Meteor.user();
  var collectionName = collection._name.slice(0,1).toUpperCase() + collection._name.slice(1);

  // make sure user has rights to upvote first
  if (!user || !canUpvote(user, collection, true) || hasUpvotedItem(item, user))
    return false;

  // in case user is upvoting a previously downvoted item, cancel downvote first
  // cancelDownvote(collection, item, user);

  // votes/score
  var result = collection.update(
    { _id: item && item._id, upvoters: { $not: { $in: [user._id] } } }, 
    {
      $addToSet: { upvoters: user._id },
      $inc: { upvotes: 1 }
    }
  );

  if (result > 0) {
    // add item to list of user's upvoted items
    addVote(user._id, item._id, collectionName);

    // if the item is upvoted by owner, don't modify reputation
    if (item.userId != user._id) 
      Meteor.users.update(user._id, { $inc: { 'stats.reputation': 1 } });
  }
  return true;
};

var cancelUpvote = function (collection, item) {
  var user = Meteor.user();
  var collectionName = collection._name.slice(0,1).toUpperCase() + collection._name.slice(1);

  // if user isn't among the upvoters, abort
  if(!hasUpvotedItem(item, user))
    return false;

  // votes/score
  var result = collection.update(
    {_id: item && item._id, upvoters: { $in: [user._id] } },
    {
      $pull: { upvoters: user._id },
      $inc: { upvotes: -1 }
    }
  );

  if (result > 0) {
    // Remove item from list of upvoted items
    removeVote(user._id, item._id, collectionName);

    // if the item is upvoted by owner, don't modify reputation
    if (item.userId != user._id) 
      Meteor.users.update(user._id, { $inc: { 'stats.reputation': -1 } });
  }
  return true;
};

// end general upvoting/downvoting -------------------

Meteor.methods({
  upvoteComment: function (comment) {
    return upvoteItem.call(this, Comments, comment);
  },
  cancelUpvoteComment: function (comment) {
    return cancelUpvote.call(this, Comments, comment);
  },
  vote: function (topic, side) {
    return voteTopic.call(this, topic, side);
  }
});













