/**
 * Adopted from TelescopeJS
 *
 * See: https://github.com/TelescopeJS/Telescope/blob/ba38e2a75b1de3e5a5e5332341a74d5f4424498c/lib/permissions.js
 */

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

// can upvote comments
canUpvote = function (user, collection) {
  return canPost(user);
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










