Accounts.onCreateUser(function (options, user) {
  var userProperties = {
    profile: options.profile || {},
    stats: {
      reputation: 0,
      topicsCount: 0,
      commentsCount: 0,
      followersCount: 0
      // isInvited: false,
      // invitedCount: 0,
    },
    activity: { // activity involving other users/collections
      upvotedComments: [],
      followers: [], 
      followingUsers: [], 
      followingTopics: [], 
      discussedTopics: []
    }
  };
  user = _.extend(user, userProperties);
  
  // set notifications default preferences
  user.profile.notifications = {
    media: {
      onsite: true
    },
    couriers: {
      newTopic: {
        onsite: true
      },
      newComment: {
        onsite: true
      },
      newReply: {
        onsite: true
      },
      newFollower: {
        onsite: true
      }
    }
  };

  return user;
});

Meteor.methods({
  newUser: function (email, password) {   
    if (password.length < 6)
      throw new Meteor.Error('Your password must be at least 6 characters long.');
    else {
      Accounts.createUser({
        'email': email, 
        'password': password,
        'profile': {
          'name': 'Anonymous',
          'bio': 'Not much is known about him/her, except that not much is known about him/her.'
        }
      });
      return 'Success! Your account has been created. Please check your email for a confirmation link!';
    }
  },
  changeName: function (newName) {
    Meteor.users.update(Meteor.userId(), { $set: { 'profile.name': newName } });
  },
  changeBio: function (newBio) {
    Meteor.users.update(Meteor.userId(), { $set: { 'profile.bio': newBio } });
  },
  changeEmail: function (newEmail) {
    Meteor.users.update(Meteor.userId(), { $set: { 
      'emails': [{ 'address': newEmail, 'verified': false }] // send verification email ?
    } });
  },
  changePreferences: function (newPreferences) {
    Meteor.users.update(Meteor.userId(), { $set: newPreferences });
  },
  newFollowerNotification: function (followingId) { // initiated by the follower
    var follower = Meteor.user();

    var notificationData = {
      follower: { '_id': follower._id, 'name': follower.profile.name }
    };

    // notify user who follower is following
    Herald.createNotification(followingId, { courier: 'newFollower', data: notificationData });
  },
  newTopicNotification: function (topic) { // initiated by the topic creator
    var user = Meteor.user(); // topic owner

    if (!user.activity || !user.activity.followers) return;

    var notificationData = {
      author: { '_id': user._id, 'name': user.profile.name },
      topic: _.pick(topic, '_id', 'title')
    };

    // notify owner's followers
    _.each(user.activity.followers, function (followerId) {
      Herald.createNotification(followerId, { courier: 'newTopic', data: notificationData });
    });
  },
  newCommentNotification: function (comment) { // initiated by the comment creator
    var topic = Topics.findOne(comment.topicId);
    var replyToId = comment.replyTo;
    var user = Meteor.user(); // comment owner
    var notified = [];

    var notificationData = {
      author: { '_id': user._id, 'name': user.profile.name },
      comment: _.pick(comment, '_id'),
      topic: _.pick(topic, '_id', 'title')
    };

    if (!!replyToId) { // comment reply      
      var replyTo = Comments.findOne(replyToId);

      notificationData.replyToId = replyToId;

      // notify replyTo owner
      // unless user is just replying to self
      if (replyTo.userId !== user._id) {

        // combine notifications if more than 5 ?
        Herald.createNotification(replyTo.userId, { courier: 'newReply', data: notificationData });
        notified.push(replyTo.userId);
      }

    }

    // notify topic owner
    // unless the comment owner is also the topic owner,
    // or the topic owner is the replyTo owner (in which case we already notified them with 'newReply')
    if (topic.userId !== user._id && !_.contains(notified, topic.userId)) {
      Herald.createNotification(topic.userId, { courier: 'newComment', data: notificationData });
      notified.push(topic.userId);
    }

    // notify topic followers
    var topicFollowers = _.without(topic.followers, notified);
    _.each(topicFollowers, function (followerId) {

      // in case user is following the topic
      if (followerId !== user._id)
        Herald.createNotification(followerId, { courier: 'newComment', data: notificationData });

      notified.push(followerId);

    });

    // notify commenter's followers
    var commenterFollowers = _.without(user.activity.followers, notified);
    _.each(commenterFollowers, function (followerId) {
      Herald.createNotification(followerId, { courier: 'newComment', data: notificationData });
      notified.push(followerId);
    });
  }
});
  


















