// Publish profile page

Meteor.publishComposite('userProfile', function (userId) {
  return {
    find: function () { // the user
      if (!this.userId) return this.ready();

      return Meteor.users.find(userId, { limit: 1, fields: { 
        'email_hash': 1, 'profile': 1, 'stats': 1, 'activity': 1 
      }});
    },
    children: [{
      find: function (user) { // users following/followed by user
        if (!user || !user.activity) return {};

        var userIds = user.activity.followers.concat(user.activity.followingUsers) || [];
        return Meteor.users.find({ '_id': { $in: userIds } }, {
          'email_hash': 1, 'profile': 1
        });
      }
    }]
  };
});

Meteor.publishComposite('userComments', function (userId, limit) {
  return {
    find: function () {
      if (!this.userId) return this.ready();

      return Comments.find({ 'userId': userId, 'isDeleted': false }, {
        sort: { 'createdAt': -1 }, 
        limit: limit
      });
    },
    children: [{
      find: function (comment) { // owners of said comments
        return Meteor.users.find(comment.userId, { 
          limit: 1, 
          fields: { 'email_hash': 1, 'profile': 1 }
        });
      }
    },{
      find: function (comment) { // topics related to said comments
        return Topics.find(comment.topicId, { 
          fields: { '_id': 1, 'title': 1, 'createdAt': 1, 'userId': 1, 'pro': 1, 'con': 1 } 
        });
      }
    }]
  };
});

Meteor.publishComposite('userTopics', function (userId, limit) {
  return {
    find: function () { // topics created/followed by user
      if (!this.userId) return this.ready();

      return Topics.find({ 'userId': userId, 'isDeleted': false }, { 
        sort: { 'createdAt': -1 },
        limit: limit,
        fields: { '_id': 1, 'title': 1, 'createdAt': 1, 'userId': 1, 'pro': 1, 'con': 1 } 
      });
    },
    children: [{
      find: function (topic) { // owner of each topic
        return Meteor.users.find(topic.userId, { 
          limit: 1, 
          fields: { 'email_hash': 1, 'profile': 1 }
        });
      }
    }, {
      find: function (topic) { // top comment of each topic
        return Comments.find({ 'topicId': topic._id, 'isDeleted': false }, { 
          'sortBy': -1, 'limit': 1 
        });
      },
      children: [{
        find: function (comment) { // owner of each top comment
          return Meteor.users.find(comment.userId, { 
            limit: 1, 
            fields: { 'email_hash': 1, 'profile': 1 }
          });
        }
      }]
    }]
  };
});






