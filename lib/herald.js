// Meteor.startup(function () {
//   Herald.collection.deny({
//     update: !canEditById,
//     remove: !canEditById
//   });
// });

// Herald.userPreference = function (userId, medium, courier) {
//   if (!courier) {
//     return Herald.getUserPreference(userId, medium);
//   }

//   // courier could be oddly formatted (newComment.topicOwner), so handle separately
//   var user = Meteor.users.findOne(userId);
//   var preferences = user && user.profile.notifications;
//   return preferences && getProperty(preferences.couriers, courier + '.' + medium);
// };

var emailRunner = function (user) {
  var notification = this;
  notification.data.user = user;
  Meteor.setTimeout(function () {
    var notificationEmail = buildEmailNotification(notification);
    sendEmail(user.emails[0].address, notificationEmail.subject, notificationEmail.html);
  }, 1);
};

var commentCourier = {
  media: {
    onsite: {},
    email: {
      emailRunner: emailRunner
    }
  },
  transform: {
    actionLink: function () {
      var topic = this.data.topic;
      var comment = this.data.comment;

      return topic && comment && getCommentRoute(topic._id, comment._id);
    }
  },
  message: {
    default: function (user) {
      return Blaze.toHTML(Blaze.With(this, function () {
        return Template.notificationNewComment;
      }));
    }
  }
};

Herald.addCourier('newComment.topicOwner', commentCourier);
Herald.addCourier('newComment.topicFollower', commentCourier);
Herald.addCourier('newComment.follower', commentCourier);

Herald.addCourier('newReply', {
  media: {
    onsite: {},
    email: {
      emailRunner: emailRunner
    }
  },
  transform: {
    actionLink: function () {
      var topic = this.data.topic;
      var comment = this.data.comment;
      return topic && comment && getCommentRoute(topic._id, comment._id);
    }
  },
  message: {
    default: function (user) {
      return Blaze.toHTML(Blaze.With(this, function () {
        return Template.notificationNewReply;
      }));
    }
  }
});

Herald.addCourier('newTopic', {
  media: {
    onsite: {},
    email: {
      emailRunner: emailRunner
    }
  },
  transform: {
    actionLink: function () {
      var topic = this.data.topic;
      return topic && getTopicRoute(topic._id);
    }
  },
  message: {
    default: function (user) {
      return Blaze.toHTML(Blaze.With(this, function () {
        return Template.notificationNewTopic;
      }));
    }
  }
});

Herald.addCourier('newFollower', {
  media: {
    onsite: {},
    email: {
      emailRunner: emailRunner
    }
  },
  transform: {
    actionLink: function () {
      var follower = this.data.follower;
      var userId = Meteor.userId();

      if (!follower || !userId) return;
      return this.data.count ? getProfileRoute(userId) : getProfileRoute(follower._id);
    }
  },
  message: {
    default: function (user) {
      return Blaze.toHTML(Blaze.With(this, function () {
        return Template.notificationNewFollower;
      }));
    }
  }
});

