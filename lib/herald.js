Herald.collection.deny({
  update: !canEditById,
  remove: !canEditById
});

Herald.userPreference = function (userId, medium, courier) {
  // check if user allows notifications at all
  if (!Herald.getUserPreference(userId, medium)) 
    return false;

  if (typeof courier === 'object') {
    var user = Meteor.users.findOne(userId);
    var preferences = user.profile.notifications;

    if (preferences) {
      return getProperty(preferences.couriers, courier.courier + '.' + medium);
    }
  }

  // resort to default
  return Herald.getUserPreference(userId, medium, courier);
};

Herald.addCourier('newComment', {
  media: {
    onsite: {}
  },
  transform: {
    actionLink: function () {
      var topic = this.data.topic;
      var comment = this.data.comment;

      return topic && comment && getTopicRoute(topic._id) + '#' + comment._id;
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
    onsite: {}
  },
  transform: {
    actionLink: function () {
      var topic = this.data.topic;
      var comment = this.data.comment;
      return topic && comment && getTopicRoute(topic._id) + '#' + comment._id; 
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
    onsite: {}
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
    onsite: {}
  },
  transform: {
    actionLink: function () {
      var follower = this.data.follower;
      var user = Meteor.userId();

      if (!follower || !user) return;
      return this.data.count ? getProfileRoute(user) : getProfileRoute(follower._id);
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

