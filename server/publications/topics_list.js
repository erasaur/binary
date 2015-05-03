// Publish list of topics (sorted by date) and top comment for each

Meteor.publishComposite('topicsList', function (limit) {
  check(limit, Match.Integer);

  return {
    find: function () {
      var fields = {
        'title': 1,
        'userId': 1,
        'createdAt': 1,
        'commentsCount': 1,
        'pro': 1,
        'con': 1,
        'score': 1
      };

      return Topics.find({}, { fields: fields, sort: { 'score': -1, 'createdAt': -1 }, limit: limit });
    },
    children: [{
      find: function (topic) { // top comment for each topic
        return Comments.find({ 'topicId': topic._id, 'isDeleted': false }, {
          sort: { 'upvotes': -1 },
          limit: 1
        });
      },
      children: [{
        find: function (comment) { // owner of each top comment
          return Meteor.users.find(comment.userId, { fields: { 'profile': 1, 'stats': 1 } });
        }
      }]
    }, {
      find: function (topic) { // owner of each topic
        return Meteor.users.find(topic.userId, { fields: { 'profile': 1, 'stats': 1 } });
      }
    }]
  };
});
