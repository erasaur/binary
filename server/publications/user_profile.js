// Publish profile page

Meteor.publish('userProfile', function (userId) {
  // we will have to look up user twice: once to get the 
  // followers/following users, and once again in the final
  // return statement. this is because we can't publish
  // user separately from user's followers, since we can
  // only return one cursor from each collection
  var user = Meteor.users.findOne(userId);

  /** 
   * Publish all comments created or liked by user
   */
  var commentIds = [];

  if (user && user.activity)  
    commentIds = user.activity.upvotedComments;

  var comments = Comments.find({ $or: [ { 'userId': userId }, { '_id': { $in: commentIds } } ] });

  /** 
   * Publish all topics created by user, or 
   * topics related to the comments above
   */
  var topicIds = [];
  if (typeof comments !== 'undefined')
    topicIds = _.pluck(comments.fetch(), 'topicId');

  var topics = Topics.find({ $or: [ { 'userId': userId }, { '_id': { $in: topicIds }}]}, { 
    fields: { '_id': 1, 'title': 1 } 
  });

  /** 
   * Publish all followers and following users, and 
   * all users related to the comments or topics above
   */
  var userIds = [];

  if (user && user.activity)
    userIds = _.union(user.activity.followers, user.activity.followingUsers);

  userIds.push(userId); // add back the original user

  var commentUsers = [];
  var topicUsers = [];
  if (typeof comments !== 'undefined')
    commentUsers = _.pluck(comments.fetch(), 'userId');

  if (typeof topics !== 'undefined')
    topicUsers = _.pluck(topics.fetch(), 'userId');

  userIds = _.union(userIds, commentUsers, topicUsers);

  var users = Meteor.users.find({ '_id': { $in: userIds } }, {
    fields: { 'profile': 1, 'stats': 1, 'activity': 1 }
  });

  return [comments, topics, users];
});












