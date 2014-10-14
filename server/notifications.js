Meteor.methods({
  newFollowerNotification: function (followingId) { // initiated by the follower
    var follower = Meteor.user();

    var notificationData = {
      follower: { '_id': follower._id, 'name': follower.profile.name }
    };

    // if Herald.collection.find().count() > x, merge notifications

    // notify user who follower is following
    if (Herald.userPrefrence(followingId, 'onsite', 'newFollower'))
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

      if (Herald.userPrefrence(followerId, 'onsite', 'newTopic'))
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
      if (replyTo.userId !== user._id && Herald.userPrefrence(replyTo.userId, 'onsite', 'newReply')) {
        // combine notifications if more than 5 ?
        Herald.createNotification(replyTo.userId, { courier: 'newReply', data: notificationData });
        notified.push(replyTo.userId);
      }

    }

    // notify topic owner (if topic owner wants to be notified)
    // unless the comment owner is also the topic owner,
    // or the topic owner is the replyTo owner (in which case we already notified them with 'newReply')
    if (topic.userId !== user._id && 
        !_.contains(notified, topic.userId) &&
        Herald.userPrefrence(topic.userId, 'onsite', { courier: 'newComment.topicOwner' })) 
    {
      Herald.createNotification(topic.userId, { courier: 'newComment', data: notificationData });
    }
    notified.push(topic.userId);

    // notify topic followers
    var topicFollowers = _.without(topic.followers, notified);
    _.each(topicFollowers, function (followerId) {

      // in case user is following the topic
      if (followerId !== user._id && 
          Herald.userPrefrence(followerId, 'onsite', { courier: 'newComment.topicFollower' })) 
      {
        Herald.createNotification(followerId, { courier: 'newComment', data: notificationData });
      }

      notified.push(followerId);

    });

    // notify commenter's followers
    var commenterFollowers = _.without(user.activity.followers, notified);
    _.each(commenterFollowers, function (followerId) {

      if (Herald.userPrefrence(followerId, 'onsite', { courier: 'newComment.follower' }))
        Herald.createNotification(followerId, { courier: 'newComment', data: notificationData });

      notified.push(followerId);
    });
  }
});