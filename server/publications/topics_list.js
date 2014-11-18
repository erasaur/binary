// Publish list of topics (sorted by date) and top comment for each

// Meteor.publish('topicsList', function (limit) {  
//   if (!canViewById(this.userId)) return [];

//   // set the topic display limit
//   if (limit > Topics.find().count() || !limit)
//     limit = 0;

//   // get the topics cursor and store the ids
//   var topics = Topics.find({ 'isDeleted': false }, { limit: limit, sort: { 'createdAt': -1 } });
//   var topicsArray = topics.fetch();
//   var topicIds = _.pluck(topicsArray, '_id');

//   // get the owners of each topic
//   var userIds = _.pluck(topicsArray, 'userId');
//   var users = Meteor.users.find({ '_id': { $in: userIds } }, { 
//     fields: { 'email_hash': 1, 'profile': 1 } 
//   });

//   // get the top comment id of each topic
//   var commentIds = [];

//   for (var i = topicIds.length - 1; i >= 0; i--) {
//     var comment = Comments.findOne({ 'topicId': topicIds[i], 'isDeleted': false }, {
//       sort: { 'upvotes': -1 }
//     });

//     if (comment)
//       commentIds.push(comment._id);
//   }

//   // find the top comments
//   var topComments = Comments.find({ '_id': { $in: commentIds } });

//   return [topics, topComments, users];
// });

Meteor.publishComposite('topicsList', function (limit) {
  if (!canViewById(this.userId)) {
    return {
      find: function () {
        return;
      }
    };
  } 

  return {
    find: function () {
      return Topics.find({ 'isDeleted': false }, { sort: { 'createdAt': -1 }, limit: limit });
    },
    children: [
      {
        find: function (topic) { // top comment for each topic
          return Comments.find({ 'topicId': topic._id, 'isDeleted': false }, {
            sort: { 'upvotes': -1 },
            limit: 1
          });
        },
        children: [{
          find: function (comment) { // owner of each top comment
            return Meteor.users.find(comment.userId, { fields: { 'email_hash': 1, 'profile': 1 } });
          }
        }]
      },
      {
        find: function (topic) { // owner of each topic
          return Meteor.users.find(topic.userId, { fields: { 'email_hash': 1, 'profile': 1 } });
        }  
      }
    ]
  };
});