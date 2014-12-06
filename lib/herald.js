// Meteor.startup(function () {
//   Herald.collection.deny({
//     update: !canEditById,
//     remove: !canEditById
//   });
// });

Herald.userPreference = function (userId, medium, courier) {
  // check if user allows notifications at all
  if (!Herald.getUserPreference(userId, medium)) return false;

  var user = Meteor.users.findOne(userId);
  var preferences = user.profile.notifications;

  if (preferences) {
    // courier could potentially be formatted like: newComment.topicOwner
    return getProperty(preferences.couriers, courier + '.' + medium);
  }

  // resort to default
  return Herald.getUserPreference(userId, medium, courier);
};

var emailRunner = function (user) {
  var notification = this;
  notification.data.user = user;
  Meteor.setTimeout(function () {
    var notificationEmail = buildEmailNotification(notification);
    sendEmail(user.emails[0].address, notificationEmail.subject, notificationEmail.html);
  }, 1);
};

Herald.addCourier('newComment', {
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

      return topic && comment && getTopicRoute(topic._id, comment._id);
    }
  },
  message: {
    default: function (user) {
      return Blaze.toHTML(Blaze.With(this, function () {
        return Template.notificationNewComment;
      }));  
    }
  }
});

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
      return topic && comment && getTopicRoute(topic._id, comment._id); 
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

