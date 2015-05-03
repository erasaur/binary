/**
 * @summary Publish all comments for a topic, limited by topicId, each transformed with an additional `initScore` property
 * @param {String} topicId Id of the specific topic
 * @param {String} side Each column of comments is published separately. Possible values: 'pro' or 'con'
 * @param {Number} limit Limit the amount of comments published (note that each side of comments is limited separately)
 */
Meteor.publish('topicComments', function (topicId, side, limit) {
  check([topicId, side], [String]);
  check(limit, Match.Integer);

  var pub = this;
  var topic = Topics.findOne(topicId);

  if (!topic) return this.ready();

  var selector = { 'topicId': topicId, 'side': side, 'replyTo': { $exists: false } };
  var comments = Comments.find(selector, { sort: { 'score': -1 }, limit: limit });
  var commentsHandle = comments.observeChanges({
    added: function (id, fields) {
      publishOwner(fields);
      fields.initScore = fields.score;
      pub.added('comments', id, fields);
    },
    changed: function (id, fields) {
      pub.changed('comments', id, fields);
    }
  });

  // we don't need owners to be reactive
  function publishOwner (comment) {
    var owner = Meteor.users.findOne({ '_id': comment.userId }, {
      fields: { 'profile': 1, 'stats': 1 }
    });
    pub.added('users', owner._id, owner);
  }

  pub.ready();
  pub.onStop(function () {
    commentsHandle.stop();
  });
});

/**
 * @summary Publish a specific comment
 * @param {String} commentId The id the comment
 */
Meteor.publish('topicComment', function (commentId) {
  check(commentId, String);

  var comment = Comments.findOne(commentId);
  return [
    Meteor.users.find({ '_id': comment.userId }, { fields: { 'profile': 1, 'stats': 1 } }),
    Comments.find(commentId)
  ];
});

/**
 * @summary Publish replies for specific comment
 * @param {String} commentId The id the parent comment whose replies we want
 */
Meteor.publish('commentReplies', function (commentId) {
  check(commentId, String);

  var pub = this;
  var sort = { sort: { 'score': -1 } };
  var comments = Comments.find({ 'replyTo': commentId }, sort);

  var commentsHandle = comments.observeChanges({
    added: function (id, fields) {
      publishOwner(fields);
      fields.initScore = fields.score;
      pub.added('comments', id, fields);
    },
    changed: function (id, fields) {
      pub.changed('comments', id, fields);
    }
  });

  function publishOwner (comment) {
    var owner = Meteor.users.findOne({ '_id': comment.userId }, {
      fields: { 'profile': 1, 'stats': 1 }
    });
    pub.added('users', owner._id, owner);
  }

  pub.ready();
  pub.onStop(function () {
    commentsHandle.stop();
  });
});

/**
 * @summary Publish specific topic document, along with owner and current user's new comments within this topic
 * @param {String} topicId Id of the specific topic
 * @param {Date} initDate Initial date of visiting the topic route. Used to determine which comments are new
 */
Meteor.publishComposite('singleTopic', function (topicId, initDate) {
  check(topicId, String);
  check(initDate, Date);

  var userId = this.userId;

  return {
    find: function () {
      return Topics.find(topicId);
    },
    children: [{
      find: function (topic) { // topic author
        return Meteor.users.find(topic.userId, {
          limit: 1, fields: { 'profile': 1 }
        });
      }
    }, {
      find: function (topic) { // new comments posted by currentUser
        return Comments.find({ 'userId': userId, 'createdAt': { $gt: initDate } });
      }
    }]
  };
});
