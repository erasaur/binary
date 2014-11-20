// Publish profile page

Meteor.publishComposite('userProfile', function (userId) {
  return {
    find: function () { // the user
      if (!this.userId) return this.ready();

      return Meteor.users.find(userId, { 'limit': 1, 'fields': { 
        'email_hash': 1, 'profile': 1, 'stats': 1, 'activity': 1 
      }});
    },
    children: [
      {
        find: function (user) { // comments liked/created by user
          var commentIds = user && user.activity && user.activity.upvotedComments || [];

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
          var topicIds = user && user.activity && user.activity.followingTopics || [];

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

          var userIds = _.union(user.activity.followers, user.activity.followingUsers) || [];
          return Meteor.users.find({ '_id': { $in: userIds } }, {
            'email_hash': 1, 'profile': 1
          });
        }
      }
    ]
  };
});










