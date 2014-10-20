/**
 * Adopted from TelescopeJS
 *
 * See: https://github.com/TelescopeJS/Telescope/blob/ba38e2a75b1de3e5a5e5332341a74d5f4424498c/lib/permissions.js
 */


// canView = function (user) {
//   if(getSetting('requireViewInvite', false)){

//     if(Meteor.isClient){
//       // on client only, default to the current user
//       var user=(typeof user === 'undefined') ? Meteor.user() : user;
//     }

//     if(user && (isAdmin(user) || isInvited(user))){
//       // if logged in AND either admin or invited
//       return true;
//     }else{
//       return false;
//     }

//   }
//   return true;
// };
// canViewById = function(userId, returnError){
//   // if an invite is required to view, run permission check, else return true
//   if(getSetting('requireViewInvite', false)){
//     // if user is logged in, then run canView, else return false
//     return userId ? canView(Meteor.users.findOne(userId), returnError) : false;
//   }
//   return true;
// };

// can post topics
canPost = function (user, returnError) {
  var user = (typeof user === 'undefined') ? Meteor.user() : user;
  return !!user;
  
  // if(!user){
  //   return returnError ? "no_account" : false;
  // } else if (isAdmin(user)) {
  //   return true;
  // } else if (getSetting('requirePostInvite')) {
  //   if (user.isInvited) {
  //     return true;
  //   } else {
  //     return returnError ? "no_invite" : false;
  //   }
  // } else {
  //   return true;
  // }
};
canPostById = function (userId, returnError) {
  var user = Meteor.users.findOne(userId);
  return canPost(user, returnError);
};

// can post comments
canComment = function (user, returnError) {
  return canPost(user, returnError);
};
canCommentById = function (userId, returnError) {
  var user = Meteor.users.findOne(userId);
  return canComment(user, returnError);
};

// can upvote comments
canUpvote = function (user, collection, returnError) {
  return canPost(user, returnError);
};
canUpvoteById = function (userId, returnError) {
  var user = Meteor.users.findOne(userId);
  return canUpvote(user, returnError);
};

// can follow users
canFollow = function (user, returnError) {
  return canPost(user, returnError);
};
canFollowById = function (userId, returnError) {
  var user = Meteor.users.findOne(userId);
  return canFollow(user, returnError);
};

// can edit documents
canEdit = function (user, item, returnError) {
  var user = (typeof user === 'undefined') ? Meteor.user() : user;
  
  return user && item && user._id === item.userId;
  // if (!user || !item) {
  //   return returnError ? "no_rights" : false;
  // } else if (isAdmin(user)) {
  //   return true;
  // } else if (user._id !== item.userId) {
  //   return returnError ? "no_rights" : false;
  // } else {
  //   return true;
  // }
};
canEditById = function (userId, item){
  var user = Meteor.users.findOne(userId);
  return canEdit(user, item);
};

canInvite = function (user) {
  // isAdmin(user)
  return user && user.invites && user.invites.inviteCount > 0; 
};










