// Publish a single topic

// Meteor.publish("singleTopic", function (topicId) {
//   // all comments
//   var comments = Comments.find({"topicId": topicId}, {sort: {"likes": -1}});
//   var userIds = _.pluck(comments.fetch(), "userId"); // comment owners

//   // add topic owner to list of userIds
//   var topicOwner = Topics.findOne(topicId).userId;
//   userIds.push(topicOwner);

//   // owners of all comments
//   var users = Meteor.users.find({"_id": {$in: userIds}}, {fields: {"username": 1}});

//   return [comments, users];
// });

Meteor.publish("singleTopic", function (topicId) {
  Meteor.publishWithRelations({
    handle: this,
    collection: Topics,
    filter: topicId,
    mappings: [{
      key: "userId", collection: Meteor.users, // publish topic owner
      options: { fields: { "username": 1, "profile": 1 }, limit: 1 }
    }, {
      reverse: true, // use the comments topicId to match this _id
      key: "topicId",
      collection: Comments,
      options: { sort: { "upvotes": -1 } },
      mappings: [{
        key: "userId", collection: Meteor.users, // publish comment owners
        options: { fields: { "username": 1, "profile": 1, "stats": 1 } }
      }]
    }]
  });
});