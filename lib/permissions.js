/**
 * Adopted from TelescopeJS
 *
 * See: https://github.com/TelescopeJS/Telescope/blob/ba38e2a75b1de3e5a5e5332341a74d5f4424498c/lib/permissions.js
 */

// XXX improve all permissions. most don't require entire user object,
// and don't need to have separate 'ById' functions, just typecheck params

// can post topics
canPost = function (user) {
  var user = (typeof user === 'undefined') ? Meteor.user() : user;
  return !!user;
};
canPostById = function (userId) {
  return userId && canPost(Meteor.users.findOne(userId));
};

// can post comments
canComment = function (user) {
  return canPost(user);
};
canCommentById = function (userId) {
  return userId && canComment(Meteor.users.findOne(userId));
};

// can vote comments/topics
canUpvote = function (user, comment) {
  if (!canPost(user)) return;

  // no comment will be passed in if checking for topic
  return !comment || !_.contains(comment.upvoters, user._id);
};
canUpvoteById = function (userId) {
  return userId && canUpvote(Meteor.users.findOne(userId));
};

// can follow users
canFollow = function (user, followId) {
  return canPost(user) && user._id !== followId;
};
canFollowById = function (userId, followId) {
  return userId && canFollow(Meteor.users.findOne(userId), followId);
};

// can edit documents
canEdit = function (user, item) {
  if (!canPost(user) || !item) return;
  return isAdmin(user) || user._id === item.userId;
};
canEditById = function (userId, item){
  if (!userId || !item) return;
  return canEdit(Meteor.users.findOne(userId), item);
};

canInvite = function (user) {
  if (!user) return;
  return isAdmin(user) || user.invites && !!user.invites.inviteCount;
};

canFlagComment = function (user, commentId) {
  if (!user || isAdmin(user)) return;
  return user.flags && !_.contains(user.flags.comments, commentId);
};

canFlagTopic = function (user, topicId) {
  if (!user || isAdmin(user)) return;
  return user.flags && !_.contains(user.flags.topics, topicId);
};








