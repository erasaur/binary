// Publish profile page

// Meteor.publish('userProfile', function (userId) {
//   if (!canViewById(this.userId)) return [];

//   // we will have to look up user twice: once to get the 
//   // followers/following users, and once again in the final
//   // return statement. this is because we can't publish
//   // user separately from user's followers, since we can
//   // only return one cursor from each collection
//   var user = Meteor.users.findOne(userId);

//   /** 
//    * Publish all comments created or liked by user
//    */
//   var commentIds = [];

//   if (user && user.activity)  
//     commentIds = user.activity.upvotedComments;

//   var comments = Comments.find({ 
//     $or: [ { 'userId': userId }, { '_id': { $in: commentIds } } ], 
//     isDeleted: false
//   });

//   /** 
//    * Publish all topics created or followed by user, or 
//    * topics related to the comments above
//    */
//   var topicIds = [];
//   if (typeof comments !== 'undefined')
//     topicIds = _.pluck(comments.fetch(), 'topicId');

//   if (user.activity && user.activity.followingTopics)
//     topicIds = _.union(topicIds, user.activity.followingTopics);

//   var topics = Topics.find({ 
//     $or: [ { 'userId': userId }, { '_id': { $in: topicIds } } ]
//   }, { 
//     fields: { '_id': 1, 'title': 1, 'createdAt': 1, 'userId': 1, 'pro': 1, 'con': 1 } 
//   });

//   /** 
//    * Publish all comments (including top comments for topics)
//    */
//   var topCommentIds = [];

//   for (var i = topicIds.length - 1; i >= 0; i--) {
//     var comment = Comments.findOne({ 'topicId': topicIds[i] }, {
//       sort: { 'upvotes': -1 }
//     });

//     if (comment)
//       topCommentIds.push(comment._id);
//   }

//   if (topCommentIds.length)
//     commentIds = _.union(commentIds, topCommentIds);

//   comments = Comments.find({ 
//     $or: [ { 'userId': userId }, { '_id': { $in: commentIds } } ], 
//     isDeleted: false
//   });

//   /** 
//    * Publish all followers and following users, and 
//    * all users related to the comments or topics above
//    */
//   var userIds = [];

//   if (user && user.activity)
//     userIds = _.union(user.activity.followers, user.activity.followingUsers);

//   userIds.push(userId); // add back the original user

//   var commentUsers = [];
//   var topicUsers = [];
//   if (typeof comments !== 'undefined')
//     commentUsers = _.pluck(comments.fetch(), 'userId');

//   if (typeof topics !== 'undefined')
//     topicUsers = _.pluck(topics.fetch(), 'userId');

//   userIds = _.union(userIds, commentUsers, topicUsers);

//   var users = Meteor.users.find({ '_id': { $in: userIds } }, {
//     fields: { 'email_hash': 1, 'profile': 1, 'stats': 1, 'activity': 1 }
//   });

//   return [comments, topics, users];
// });

Meteor.publishComposite('userProfile', function (userId) {
  if (!canViewById(this.userId)) {
    return {
      find: function () {
        return;
      }
    };
  }

  return {
    find: function () { // the user
      return Meteor.users.find(userId, { 'limit': 1, 'fields': { 
        'email_hash': 1, 'profile': 1, 'stats': 1, 'activity': 1 
      }});
    },
    children: [
      {
        find: function (user) { // comments liked/created by user
          var commentIds = user && user.activity && user.activity.upvotedComments;

          return Comments.find({ 
            $or: [ { 'userId': userId }, { '_id': { $in: commentIds } } ], 
            'isDeleted': false 
          });
        },
        children: [
          {
            find: function (comment) { // owners of said comments
              return Meteor.users.find(comment.userId, { 'limit': 1, 'fields': {
                'email_hash': 1, 'profile': 1
              }});
            }
          },
          {
            find: function (comment) { // topics related to said comments
              return Topics.find(comment._id, { 
                fields: { '_id': 1, 'title': 1, 'createdAt': 1, 'userId': 1, 'pro': 1, 'con': 1 } 
              });
            }
          }
        ]
      },
      {
        find: function (user) { // topics created/followed by user
          var topicIds = user && user.activity && user.activity.followingTopics;

          return Topics.find({ 
            $or: [ { 'userId': userId }, { '_id': { $in: topicIds } } ],
            'isDeleted': false
          }, { 
            fields: { '_id': 1, 'title': 1, 'createdAt': 1, 'userId': 1, 'pro': 1, 'con': 1 } 
          });
        },
        children: [
          {
            find: function (topic) { // owner of each topic
              return Meteor.users.find(topic.userId, { 'limit': 1, 'fields': {
                'email_hash': 1, 'profile': 1
              }});
            }
          },
          {
            find: function (topic) { // top comment of each topic
              return Comments.find({ 'topicId': topic._id, 'isDeleted': false }, { 
                'sortBy': -1, 'limit': 1 
              });
            },
            children: [{
              find: function (comment) { // owner of each top comment
                return Meteor.users.find(comment.userId, { 'limit': 1, 'fields': {
                  'email_hash': 1, 'profile': 1
                }});
              }
            }]
          }
        ]
      },
      {
        find: function (user) { // users following/followed by user
          if (!user || !user.activity) return {};

          var userIds = _.union(user.activity.followers, user.activity.followingUsers);
          return Meteor.users.find({ '_id': { $in: userIds } }, {
            'email_hash': 1, 'profile': 1
          });
        }
      }
    ]
  };
});










