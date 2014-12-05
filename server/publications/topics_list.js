// Publish list of topics (sorted by date) and top comment for each

Meteor.publishComposite('topicsList', function (limit) {
  return {
    find: function () {
      if (!this.userId) return this.ready();

      return Topics.find({ 'isDeleted': false }, { sort: { 'createdAt': -1 }, limit: limit });
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
          return Meteor.users.find(comment.userId, { fields: { 'email_hash': 1, 'profile': 1 } });
        }
      }]
    }, {
      find: function (topic) { // owner of each topic
        return Meteor.users.find(topic.userId, { fields: { 'email_hash': 1, 'profile': 1 } });
      }  
    }]
  };
});