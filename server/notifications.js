Meteor.methods({
  newFollowerNotification: function (followingId) { // initiated by the follower
    var follower = Meteor.user();

    var notificationData;

    // notify user who follower is following
    if (Herald.userPrefrence(followingId, 'onsite', 'newFollower')) {

      var aggregate = Herald.collection.findOne({ 
        'data.count': { $exists: true }, courier: 'newFollower', read: false 
      });

      // unread aggregate notification exists, update it
      // ensure that the same user can't keep following/unfollowing to increment aggregate
      if (!!aggregate && !_.contains(aggregate.data.ids, follower._id)) {
        Herald.collection.update(aggregate._id, { 
          $inc: { 'data.count': 1 },
          $addToSet: { 'data.ids': follower._id } 
        });
      }
      // unread aggregate notification doesn't exist
      else {
        var count = Herald.collection.find({ 
          courier: 'newFollower', read: false 
        }).count();

        // combine unread notifications if there are too many
        if (count >= 4) {
          notificationData = { 'ids': [follower._id], 'count': count + 1 };

          // remove all instances of 'newFollower' notification
          Herald.collection.remove({ courier: 'newFollower', read: false });
          Herald.createNotification(followingId, { courier: 'newFollower', data: notificationData });
        }

        // otherwise add notification as long as it's not from same user
        else if (!Herald.collection.findOne({ 
          courier: 'newFollower', read: false, 'data.follower._id': follower._id 
        })) 
        {
          notificationData = {
            follower: { '_id': follower._id, 'name': follower.profile.name }
          };

          Herald.createNotification(followingId, { courier: 'newFollower', data: notificationData });
        }
      } 
    }
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
      notified.push(topic.userId);
    }

    // notify topic followers
    var topicFollowers = _.difference(topic.followers, notified);
    _.each(topicFollowers, function (followerId) {

      // in case user is following the topic
      if (followerId !== user._id && 
          Herald.userPrefrence(followerId, 'onsite', { courier: 'newComment.topicFollower' })) 
      {
        Herald.createNotification(followerId, { courier: 'newComment', data: notificationData });
        notified.push(followerId);
      }
    });

    // notify commenter's followers
    var commenterFollowers = _.difference(user.activity.followers, notified);
    _.each(commenterFollowers, function (followerId) {

      if (Herald.userPrefrence(followerId, 'onsite', { courier: 'newComment.follower' }))
        Herald.createNotification(followerId, { courier: 'newComment', data: notificationData });

      // notified.push(followerId);
    });
  }
});