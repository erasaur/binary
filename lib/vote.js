var hasUpvotedItem = function (item, user) {
  return item.upvoters && item.upvoters.indexOf(user._id) > -1;
};

// var addVote = function (userId, vote, collection, upOrDown) {
//   var field = 'votes.' + upOrDown + 'voted' + collection;
//   var add = {};
//   add[field] = vote;
//   var result = Meteor.users.update({_id: userId}, {
//     $addToSet: add
//   });
// };

var addVote = function (userId, itemId, collection) {
  var field = 'activity.upvoted' + collection;
  var add = {};
  add[field] = itemId;
  Meteor.users.update(userId, { $addToSet: add });
};

var removeVote = function (userId, itemId, collection) {
  var field = 'activity.upvoted' + collection;
  var remove = {};
  remove[field] = itemId;
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
    // var vote = {
    //   itemId: item._id,
    //   votedAt: new Date(),
    //   power: votePower
    // };
    // addVote(user._id, vote, collectionName, 'up');
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

Meteor.methods({
  upvoteComment: function (comment, user) {
    return upvoteItem.call(this, Comments, comment);
  },
  cancelUpvoteComment: function (comment, user) {
    return cancelUpvote.call(this, Comments, comment);
  }
});













