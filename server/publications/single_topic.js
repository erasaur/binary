// We don't use publish-composite here since we need to transform
// the documents as they are added, by inserting temporary *non-reactive*
// values (to be used for sorting client-side) so sorting won't keep
// changing as the comments change.
 
/**
 * @summary Publish all comments for a topic, limited by topicId, each transformed with an additional `initVotes` property
 * @param {String} topicId Id of the specific topic
 * @param {String} sortBy Sort option. Possible values: 'top' [default] or 'newest'
 * @param {String} side Each column of comments is published separately. Possible values: 'pro' or 'con'
 * @param {Number} limit Limit the amount of comments published (note that each side of comments is limited separately)
 */
Meteor.publish('topicComments', function (topicId, sortBy, side, limit) {
  var topic = Topics.findOne(topicId);

  if (!topic || !this.userId) return this.ready();

  var sort = sortBy === 'newest' ? 
    { 'createdAt': -1, 'upvotes': -1 } : { 'upvotes': -1, 'createdAt': -1 };

  var pub = this;
  var comments = Comments.find({ 'topicId': topicId, 'side': side }, { 
    sort: sort, 
    limit: limit
  });

  var commentsHandle = comments.observeChanges({
    // in added case, fields essentially is the entirety of the added comment
    added: function (id, fields) { 
      var replyToUser = publishAssociatedOwners(id, fields); // publish the owners associated with this comment

      fields.initVotes = fields.upvotes;
      if (replyToUser) fields.replyToUser = replyToUser; // so we don't necessarily need to pub replyTo comment to get the user

      pub.added('comments', id, fields);
    },
    changed: function (id, fields) {
      pub.changed('comments', id, fields);
    }
  });

  // we don't need owners to be reactive
  function publishAssociatedOwners (commentId, comment) {
    var replyTo = Comments.findOne(comment.replyTo);
    var owner = Meteor.users.findOne({ '_id': comment.userId }, { 
      fields: { 'email_hash': 1, 'profile': 1, 'stats': 1 } 
    });

    pub.added('users', owner._id, owner);

    if (typeof replyTo !== 'undefined') {
      var replyToUser = Meteor.users.findOne({ '_id': replyTo.userId });
      if (!replyToUser) return;
      
      return replyToUser.profile && replyToUser.profile.name;
    }
  }

  pub.ready();

  pub.onStop(function () {
    commentsHandle.stop();
  });
});

/**
 * @summary Publish replies for specific comment
 * @param {Array} commentIds The id's of the comment replies
 * @param {String} sortBy Sort option. Possible values: 'top' [default] or 'newest'
 */
Meteor.publish('commentReplies', function (commentIds, sortBy) {
  if (!this.userId) return this.ready();

  var userId = this.userId;
  var sort = sortBy === 'newest' ? 
    { 'upvotes': -1, 'createdAt': -1 } : { 'createdAt': -1, 'upvotes': -1 };

  var pub = this;
  var comments = Comments.find({ 'replyTo': { $in: commentIds } }, { 
    sort: sort
  });

  var commentsHandle = comments.observeChanges({
    added: function (id, fields) { 
      var replyToUser = publishAssociatedOwners(id, fields);
      fields.initVotes = fields.upvotes;
      if (replyToUser) fields.replyToUser = replyToUser;

      pub.added('comments', id, fields);
    },
    changed: function (id, fields) {
      pub.changed('comments', id, fields);
    }
  });

  function publishAssociatedOwners (commentId, comment) {
    var replyTo = Comments.findOne(comment.replyTo);
    var owner = Meteor.users.findOne({ '_id': comment.userId }, { 
      fields: { 'email_hash': 1, 'profile': 1, 'stats': 1 } 
    });

    pub.added('users', owner._id, owner);

    if (typeof replyTo !== 'undefined') {
      var replyToUser = Meteor.users.findOne({ '_id': replyTo.userId });
      if (!replyToUser) return;
      
      // pub.added('users', replyToUser._id, replyToUser);
      return replyToUser.profile && replyToUser.profile.name;
    }
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
  var userId = this.userId;

  return {
    find: function () {
      if (!userId) return this.ready();

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