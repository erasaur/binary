// Publish profile page


// filter pubs by category (created, liked, etc)
// in profile page, have to init a new infinite scroll thing for every category change
// so that scrolling to bottom of one doesn't affect the other
// maybe consider using separate paths for each category (like the sortBy in topic page)

// separate the topic publications somehow so that pro comments and con comments can be 
// loaded at once. currently publishing the most recent comments might end up with a long list of
// pro comments and no con comments added

// look into kadira academy and bulletproof meteor


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

        var userIds = _.union(user.activity.followers, user.activity.followingUsers) || [];
        return Meteor.users.find({ '_id': { $in: userIds } }, {
          'email_hash': 1, 'profile': 1
        });
      }
    }]
  };
});

Meteor.publishComposite('userComments', function (userId, filter, limit) {
  return {
    find: function () {
      if (!this.userId) return this.ready();

      var user = Meteor.users.findOne(userId);
      var upvoted = user && user.activity && user.activity.upvotedComments || [];
      var query = {
        'created': { 'userId': userId, 'isDeleted': false },
        'upvoted': { '_id': { $in: upvoted }, 'isDeleted': false }
      };
      var opts = {
        sort: { 'createdAt': -1 }, 
        limit: limit
      };

      if (!_.has(query, filter))
        return this.ready();

      return Comments.find(query[filter], opts);
    },
    children: [{
      find: function (comment) { // owners of said comments
        return Meteor.users.find(comment.userId, { 'limit': 1, 'fields': {
          'email_hash': 1, 'profile': 1
        }});
      }
    },{
      find: function (comment) { // topics related to said comments
        return Topics.find(comment._id, { 
          fields: { '_id': 1, 'title': 1, 'createdAt': 1, 'userId': 1, 'pro': 1, 'con': 1 } 
        });
      }
    }]
  };
});

Meteor.publishComposite('userTopics', function (userId, filter, limit) {
  return {
    find: function () { // topics created/followed by user
      if (!this.userId) return this.ready();

      var user = Meteor.users.findOne(userId);
      var activity = user && user.activity;
      var discussed = activity && activity.discussedTopics || [];
      var following = activity && activity.followingTopics || [];

      var opts = { 
        sort: { 'createdAt': -1 },
        limit: limit,
        fields: { '_id': 1, 'title': 1, 'createdAt': 1, 'userId': 1, 'pro': 1, 'con': 1 } 
      };
      var query = {
        'created': { 'userId': userId, 'isDeleted': false },
        'discussed': { '_id': { $in: discussed }, 'isDeleted': false },
        'following': { '_id': { $in: following }, 'isDeleted': false }
      };

      if (!_.has(query, filter))
        return this.ready();

      return Topics.find(query[filter], opts);
    },
    children: [{
      find: function (topic) { // owner of each topic
        return Meteor.users.find(topic.userId, { 'limit': 1, 'fields': {
          'email_hash': 1, 'profile': 1
        }});
      }
    }, {
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
    }]
  };
});






