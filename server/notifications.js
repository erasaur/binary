Meteor.methods({
  newFollowerNotification: function (followingId) { // initiated by the follower
    var follower = Meteor.user();

    var notificationData = {
      follower: { '_id': follower._id, 'name': follower.profile.name }
    };

    // notify user who follower is following
    Herald.createNotification(followingId, { 
      courier: 'newFollower', 
      data: notificationData, 
      'duplicates': false, 
      'aggregate': true,
      'aggregateAt': 3 
    });
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
      if (Herald.userPreference(followerId, 'onsite', 'newTopic')) {
        Herald.createNotification(followerId, { 
          courier: 'newTopic', 
          data: notificationData // don't aggregate new topics
        });
      }
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
      topic: _.pick(topic, '_id', 'title', 'userId')
    };

    if (replyToId) { // comment reply      
      var replyTo = Comments.findOne(replyToId);

      // notify replyTo owner, unless user is just replying to self
      if (replyTo && replyTo.userId !== user._id) {
        Herald.createNotification(replyTo.userId, { 
          courier: 'newReply', 
          data: notificationData, 
          // 'duplicates': false,
          'aggregate': true,
          'aggregateAt': 3,
          'aggregateUnder': 'replyTo' // combine notifications that share the same comment
        });
        notified.push(replyTo.userId);
      }
    }

    // notify topic owner (if topic owner wants to be notified)
    // unless the comment owner is also the topic owner,
    // or the topic owner is the replyTo owner (in which case we already notified them with 'newReply')
    if (topic && topic.userId !== user._id && !_.contains(notified, topic.userId)) {
      Herald.createNotification(topic.userId, { 
        courier: 'newComment.topicOwner', 
        data: notificationData, 
        'duplicates': false,
        'aggregate': true,
        'aggregateAt': 3,
        'aggregateUnder': 'topic'
      });
      notified.push(topic.userId);
    }

    // notify topic followers
    var topicFollowers = _.difference(topic.followers, notified);
    
    _.each(topicFollowers, function (followerId) {
      // in case user is following the topic
      if (followerId !== user._id) {
        Herald.createNotification(followerId, { 
          courier: 'newComment.topicFollower', 
          data: notificationData, 
          'aggregate': true,
          'aggregateAt': 3,
          'aggregateUnder': 'topic'
        });
        notified.push(followerId);
      }
    });

    // notify commenter's followers
    var commenterFollowers = _.difference(user.activity.followers, notified);
    
    _.each(commenterFollowers, function (followerId) {
      Herald.createNotification(followerId, { 
        courier: 'newComment.follower', 
        data: notificationData, 
        'aggregate': true,
        'aggregateAt': 3,
        'aggregateUnder': 'topic'
      });     
      // notified.push(followerId);
    });
  }
});