// Publish a single topic

/**
 * Publish all the comments associated with topicId, as well as
 * all of the users who are owners of these comments.
 * 
 * We don't use publish-composite here since we need to transform
 * the documents as they are added, by inserting temporary *non-reactive*
 * values (to be used for sorting client-side) so sorting won't keep
 * changing as the comments change.
 */
Meteor.publish('topicComments', function (topicId, sortBy, side, limit) {
  var topic = Topics.findOne(topicId);

  // if topic is deleted or no permission to view
  if (!topic || topic.isDeleted || !this.userId) return this.ready();

  var sort = sortBy === 'newest' ? 
    { 'createdAt': -1, 'upvotes': -1 } : { 'upvotes': -1, 'createdAt': -1 };
  var commentsHandle; // handler for changes in comments collection
  var commentOwnersHandle = []; // handlers for owners associated with the comments

  var pub = this;
  var comments = Comments.find({ 'topicId': topicId, 'side': side }, { 
    sort: sort, 
    limit: limit
  });

  commentsHandle = comments.observeChanges({
    // in added case, fields essentially is the entirety of the added comment
    added: function (id, fields) { 
      publishCommentOwner(id, fields); // publish the owner associated with this comment

      // fields.initDate = fields.createdAt;
      fields.initVotes = fields.upvotes;

      pub.added('comments', id, fields);
    },
    changed: function (id, fields) {
      pub.changed('comments', id, fields);
    },
    removed: function (id) {
      // remove the owner handle attached to this comment
      commentOwnersHandle[id] && commentOwnersHandle[id].stop();
      pub.removed('comments', id);
    }
  });

  function publishCommentOwner (commentId, comment) {
    var owners = Meteor.users.find({ '_id': comment.userId }, { 
      fields: { 'email_hash': 1, 'profile': 1, 'stats': 1 } 
    });
    // attach an owner handle to this comment, and store it with comment's id
    // as a key so we can remove the handle when the comment is removed
    commentOwnersHandle[commentId] = owners.observeChanges({
      added: function (id, fields) {
        pub.added('users', id, fields);
      },
      changed: function (id, fields) {
        pub.changed('users', id, fields);
      },
      removed: function (id, fields) {
        commentOwnersHandle[id] && commentOwnersHandle[id].stop();
        pub.removed('users', id);
      }
    });
  }

  pub.ready();

  pub.onStop(function () {
    commentsHandle.stop();
    _.each(commentOwnersHandle, function (handle) {
      handle.stop();
    });
  });
});

Meteor.publish('commentReplies', function (commentIds, sortBy) {
  var userId = this.userId;
  if (!userId) return this.ready();

  var sort = sortBy === 'newest' ? 
    { 'upvotes': -1, 'createdAt': -1 } : { 'createdAt': -1, 'upvotes': -1 };
  var commentsHandle; // handler for changes in comments collection
  var commentOwnersHandle = []; // handlers for owners associated with the comments

  var pub = this;
  var comments = Comments.find({ 'replyTo': { $in: commentIds } }, { 
    sort: sort
  });

  commentsHandle = comments.observeChanges({
    added: function (id, fields) { 
      publishCommentOwner(id, fields);

      // fields.initDate = fields.createdAt;
      fields.initVotes = fields.upvotes;

      pub.added('comments', id, fields);
    },
    changed: function (id, fields) {
      pub.changed('comments', id, fields);
    },
    removed: function (id) {
      commentOwnersHandle[id] && commentOwnersHandle[id].stop();
      pub.removed('comments', id);
    }
  });

  function publishCommentOwner (commentId, comment) {
    var owners = Meteor.users.find({ '_id': comment.userId }, { 
      fields: { 'email_hash': 1, 'profile': 1, 'stats': 1 } 
    });
    commentOwnersHandle[commentId] = owners.observeChanges({
      added: function (id, fields) {
        pub.added('users', id, fields);
      },
      changed: function (id, fields) {
        pub.changed('users', id, fields);
      },
      removed: function (id, fields) {
        commentOwnersHandle[id] && commentOwnersHandle[id].stop();
        pub.removed('users', id);
      }
    });
  }

  pub.ready();

  pub.onStop(function () {
    commentsHandle.stop();
    _.each(commentOwnersHandle, function (handle) {
      handle.stop();
    });
  });
});

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