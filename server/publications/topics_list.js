// Publish list of topics (sorted by date) and top comment for each

Meteor.publish('topicsList', function (limit) {  
  // set the topic display limit
  if (limit > Topics.find().count() || !limit)
    limit = 0;

  // get the topics cursor and store the ids
  var topics = Topics.find({}, { limit: limit, sort: { 'createdAt': -1 } });
  var topicIds = _.pluck(topics.fetch(), '_id');

  // get the owners of each topic
  var userIds = _.pluck(topics.fetch(), 'userId');
  var users = Meteor.users.find({ '_id': { $in: userIds } }, { 
    fields: { 'profile': 1 } 
  });

  // get the top comment id of each topic
  var commentIds = [];

  for (var i = topicIds.length - 1; i >= 0; i--) {
    var comment = Comments.findOne({ 'topicId': topicIds[i] }, {
      sort: { 'upvotes': -1 }
    });

    if (comment)
      commentIds.push(comment._id);
  }

  // find the top comments
  var topComments = Comments.find({'_id': {$in: commentIds}});

  return [topics, topComments, users];
});

// Meteor.publish('topicsList', function (limit) {
//   Meteor.publishWithRelations({
//     handle: this,
//     collection: Topics,
//     options: { limit: limit },
//     mappings: [{
//       key: 'userId', collection: Meteor.users, // publish topic owner
//       options: { fields: { 'username': 1 } }
//     }, {
//       reverse: true, // use the comments topicId to match this _id
//       key: 'topicId',
//       collection: Comments,
//       options: { sort: { 'upvotes': -1 }, limit: 1 },
//       mappings: [{
//         key: 'userId', collection: Meteor.users, // publish comment owners
//         options: { fields: { 'username': 1 }, limit: 1 }
//       }]
//     }]
//   });
// });