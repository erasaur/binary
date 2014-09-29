// Publish a single topic

Meteor.publish("singleTopic", function (topicId) {
  // all comments
  var comments = Comments.find({"topicId": topicId}, {sort: {"likes": -1}});
  var userIds = _.pluck(comments.fetch(), "userId"); // comment owners

  // add topic owner to list of userIds
  var topicOwner = Meteor.users.findOne({"activity.topics": topicId})["_id"];
  userIds.push(topicOwner);

  // owners of all comments
  var users = Meteor.users.find({"_id": {$in: userIds}}, {fields: {"username": 1}});

  return [comments, users];
});