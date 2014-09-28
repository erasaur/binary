/**
 * All publications for profile page
 */

// publish specific user (profile page)
Meteor.publish("profileUser", function (userId) { 
  //if userId refers to current user, meteor will not publish duplicate info
  return Meteor.users.find(userId, {fields: {"username": 1, "activity": 1}});
});

// usernames of all the other users in the profile, such as followers/following. 
// separate publish because meteor doesn't allow publishing two cursors from same collection
Meteor.publish("profileUsers", function (userId) { 
  var user = Meteor.users.findOne(userId);
  var follows = _.union(user.activity.followers, user.activity.following);
  return Meteor.users.find({"_id": {$in: follows}}, {fields: {"username": 1}});
});

// publish all topics created by userId, or related to the comments written by userId
Meteor.publish("profileTopics", function (userId) {
  var comments = Comments.find({"userId": userId}).fetch();
  // all the topics associated with these comments
  var commentTopics = _.pluck(comments, "topic");
  // _.each(comments, function(comment) {
  //   result.push(comment.topic);
  // });
  return Topics.find({$or: [{"userId": userId}, {"_id": {$in: commentTopics}}]}, 
                     {fields: {"_id": 1, "title": 1}});
});

// publish all comments created or liked by userId
Meteor.publish("profileComments", function (userId) {
  var liked = Meteor.users.findOne(userId).activity.liked;

  return Comments.find({$or: [{"userId": userId}, {"_id": {$in: liked}}]}, 
                       {fields: {"_id": 1, "userId": 1, "content": 1, "topic": 1}});
});

// Meteor.publish("profileCommentsByUser", function(userId, limit) {
//  return Comments.find({"userId": userId}, 
//                       {limit: limit, fields: {"_id": 1, "content": 1, "topic": 1}});
// });

// Meteor.publish("profileCommentsByLiked", function(userId, limit) {
//  var liked = Meteor.users.findOne(userId).activity.liked;
//
//  return Comments.find({"_id": {$in: liked}}, 
//                       {limit: limit, fields: {"_id": 1, "userId": 1, "content": 1, "topic": 1}});
// });









