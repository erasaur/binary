/**
 * All publications for profile page
 */


Meteor.publish("profileUser", function(username) { //publish specific user (profile page)
  return Meteor.users.find({"username": username}, {fields: {"username": 1, "activity": 1}}); //if username is the current user, meteor will not publish duplicate info
});
Meteor.publish("profileUsers", function(username) { //usernames of all the other users in the profile, such as followers/following. separate publish because meteor doesn't allow publishing two cursors from same collection
  var user = Meteor.users.findOne({"username": username}),
      follows = _.union(user.activity.followers, user.activity.following);
  return Meteor.users.find({"_id": {$in: follows}}, {fields: {"username": 1}}); //can't combine this with the return value in publish "profileUser", since the fields we are publishing are different
});
Meteor.publish("profileTopics", function(user) {
  var comments = CommentsModel.find({"owner": user}).fetch(), result = [];
  _.each(comments, function(comment) {
    result.push(comment.topic);
  });
  return TopicsModel.find({$or: [{"owner": user}, {"_id": {$in: result}}]}, {fields: {"_id": 1, "title": 1}});
});
Meteor.publish("profileComments", function(user) { //publish by owner rather than by topic
  var liked = Meteor.users.findOne({"username": user}).activity.liked;

  return CommentsModel.find({$or: [{"owner": user}, {"_id": {$in: liked}}]}, {fields: {"_id": 1, "owner": 1, "content": 1, "topic": 1}});
});
// Meteor.publish("profileCommentsByUser", function(user, limit) {
//  return CommentsModel.find({"owner": user}, {limit: limit, fields: {"_id": 1, "content": 1, "topic": 1}});
// });
// Meteor.publish("profileCommentsByLiked", function(user, limit) { //publish by owner rather than by topic
//  var liked = Meteor.users.findOne({"username": user}).activity.liked;

//  return CommentsModel.find({"_id": {$in: liked}}, {limit: limit, fields: {"_id": 1, "owner": 1, "content": 1, "topic": 1}});
// });