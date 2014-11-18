// Publish a single topic

/**
 * Publish all the comments associated with topicId, as well as
 * all of the users who are owners of these comments.
 * 
 * We don't use publishWithRelations here since we need to transform
 * the documents as they are added, by inserting temporary *non-reactive*
 * values (to be used for sorting client-side) so sorting won't keep
 * changing as the comments change.
 */
Meteor.publish('topicComments', function (topicId, sortBy) {
  if (!canViewById(this.userId)) return [];

  var topic = Topics.findOne(topicId);

  // if topic is deleted then don't publish comments
  if (!topic || topic.isDeleted) return null;

  var sortOptions = {
    'top': 'upvotes',
    'newest': 'createdAt'
  };
  var sortBy = sortOptions[sortBy] || 'upvotes';
  var commentsHandle; // handler for changes in comments collection
  var commentOwnersHandle = []; // handlers for owners associated with the comments

  var pub = this;
  var comments = Comments.find({ 'topicId': topicId }, { 
    sort: setProperty({}, sortBy, -1) 
  });

  commentsHandle = comments.observeChanges({
    // in added case, fields essentially is the entirety of the added comment
    added: function (id, fields) { 
      publishCommentOwner(id, fields); // publish the owner associated with this comment

      fields.initDate = fields.createdAt;
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

Meteor.publish('singleTopic', function (topicId) {
  Meteor.publishWithRelations({
    handle: this,
    collection: Topics,
    filter: topicId,
    mappings: [
    { // publish topic owner
      key: 'userId', collection: Meteor.users, 
      options: { fields: { 'profile': 1 }, limit: 1 }
    }]
  });
});

// Meteor.publish('singleTopic', function (topicId, sortBy) {
  // Meteor.publishWithRelations({
  //   handle: this,
  //   collection: Topics,
  //   filter: topicId,
  //   mappings: [
  //   { // publish topic owner
  //     key: 'userId', collection: Meteor.users, 
  //     options: { fields: { 'profile': 1 }, limit: 1 }
  //   }, 
  //   { // publish comments
  //     reverse: true, // use the comments topicId to match this _id
  //     // handle: commentHandle,
  //     key: 'topicId',
  //     collection: Comments,
  //     options: { sort: setProperty({}, sortBy, -1) },
  //     mappings: [
  //     { // publish comment owners
  //       key: 'userId', collection: Meteor.users, // publish comment owners
  //       options: { fields: { 'profile': 1, 'stats': 1 } }
  //     }]
  //   }]
  // });
// });