// Publish a single topic

// Meteor.publish('singleTopic', function (topicId) {
//   // all comments
//   var comments = Comments.find({'topicId': topicId}, {sort: {'likes': -1}});
//   var userIds = _.pluck(comments.fetch(), 'userId'); // comment owners

//   // add topic owner to list of userIds
//   var topicOwner = Topics.findOne(topicId).userId;
//   userIds.push(topicOwner);

//   // owners of all comments
//   var users = Meteor.users.find({'_id': {$in: userIds}}, {fields: {'username': 1}});

//   return [comments, users];
// });

Meteor.publish('singleTopic', function (topicId, sortBy) {
  var sortOptions = {
    'top': 'upvotes',
    'newest': 'createdAt'
  };
  var sortBy = sortOptions[sortBy] || 'upvotes';

  // var self = this;

  // var commentHandle = Comments.find(
  //   { 'topicId': topicId }
  // ).observeChanges({
  //   added: function (id, fields) {
  //     fields.initialVotes = fields.upvotes;
  //     fields.initialDate = fields.createdAt;
  //     self.added('comments', id, fields);
  //   },
  //   changed: function (id, fields) {
  //     self.changed('comments', id, fields);
  //   }
  // });

  // the publication 'handle', specifies what is published (through added, changed)
  var pub = this; 
  var topicHandle;
  var topicOwnerHandle;
  var commentsHandle; // handler for changes in comments collection
  var commentOwnersHandle;

  function publishCommentOwners (userId) {
    var owners = Meteor.users.find(
      { '_id': userId }, 
      { fields: { 'username': 1, 'profile': 1, 'stats': 1 } }
    );
    commentOwnersHandle = owners.observeChanges({
      added: function (id, fields) {
        pub.added('users', id, fields);
      },
      changed: function (id, fields) {
        pub.changed('users', id, fields);
      },
      removed: function (id, fields) {
        commentOwnersHandle.stop();
        pub.removed('users', id);
      }
    });
  }

  function publishTopicComments (topicId) {
    var comments = Comments.find(
      { 'topicId': topicId },
      { sort: setProperty({}, sortBy, -1) }
    );

    commentsHandle = comments.observeChanges({
      added: function (id, fields) {
        publishCommentOwners(fields.userId);

        fields.initDate = fields.createdAt;
        fields.initVotes = fields.upvotes;
        
        pub.added('comments', id, fields);
      },
      changed: function (id, fields) {
        pub.changed('comments', id, fields);
      },
      removed: function (id) {
        commentsHandle.stop();
        commentOwnersHandle.stop();
        pub.removed('comments', id);
      }
    });
  }

  function publishTopicOwner (userId) {
    var owner = Meteor.users.find(userId, { fields: 
      { 'username': 1, 'profile': 1 }
    });
    topicOwnerHandle = owner.observeChanges({
      added: function (id, fields) {
        pub.added('users', id, fields);
      },
      changed: function (id, fields) {
        pub.changed('users', id, fields);
      },
      removed: function (id, fields) {
        topicOwnerHandle.stop();
        pub.removed('users', id);
      }
    });
  }

  topicHandle = Topics.find(topicId).observeChanges({
    added: function (id, fields) {
      // publish associated comments
      publishTopicComments(id);
      // publish owner
      publishTopicOwner(fields.userId);
      // add to publication
      pub.added('topics', id, fields);
    },
    changed: function (id, fields) {
      pub.changed('topics', id, fields);
    },
    removed: function (id, fields) {
      topicHandle.stop();
      topicOwnerHandle.stop();
      commentsHandle.stop();
      commentOwnersHandle.stop();
      pub.removed('topics', id);
    }
  });

  pub.ready();

  // stop all handles
  pub.onStop(function () {
    topicHandle.stop();
    topicOwnerHandle.stop();
    commentsHandle.stop();
    commentOwnersHandle.stop();
  });

  // Meteor.publishWithRelations({
  //   handle: this,
  //   collection: Topics,
  //   filter: topicId,
  //   mappings: [
  //   { // publish topic owner
  //     key: 'userId', collection: Meteor.users, 
  //     options: { fields: { 'username': 1, 'profile': 1 }, limit: 1 }
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
  //       options: { fields: { 'username': 1, 'profile': 1, 'stats': 1 } }
  //     }]
  //   }]
  // });
});