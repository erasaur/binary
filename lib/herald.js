// Herald.collection.deny({
//   update: !canEditById,
//   remove: !canEditById
// });

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
  message: {
    default: function (user) {
      return Blaze.toHTML(Blaze.With(this, function () {
        return Template.notificationNewComment;
      }));  
    }
  },
  transform: {
    author: function () {
      return this.data.author.name;
    },
    profileUrl: function () {
      return getProfileRoute(this.data.author._id);
    },
    topicTitle: function () {
      return this.data.topic.title;
    },
    topicCommentUrl: function () {
      return getTopicRoute(this.data.topic._id) + '#' + this.data.comment._id;
    }
  }
});

Herald.addCourier('newReply', {
  media: {
    onsite: {}
  },
  message: {
    default: function (user) {
      return Blaze.toHTML(Blaze.With(this, function () {
        return Template.notificationNewReply;
      }));  
    }
  },
  transform: {
    author: function () {
      return this.data.author.name;
    },
    profileUrl: function () {
      return getProfileRoute(this.data.author._id);
    },
    replyToCommentUrl: function () {
      return getTopicRoute(this.data.topic._id) + '#' + this.data.replyToId;
    },
    topicTitle: function () {
      return this.data.topic.title;
    },
    topicCommentUrl: function () {
      return getTopicRoute(this.data.topic._id) + '#' + this.data.comment._id;
    }
  }
});

Herald.addCourier('newTopic', {
  media: {
    onsite: {}
  },
  message: {
    default: function (user) {
      return Blaze.toHTML(Blaze.With(this, function () {
        return Template.notificationNewTopic;
      }));  
    }
  },
  transform: {
    count: function () {
      return this.data.count;
    },
    author: function () {
      return this.data.author && this.data.author.name;
    },
    profileUrl: function () {
      return this.data.author && getProfileRoute(this.data.author._id);
    },
    topicTitle: function () {
      return this.data.topic && this.data.topic.title;
    },
    topicUrl: function () {
      return this.data.topic && getTopicRoute(this.data.topic._id);
    }
  }
});

Herald.addCourier('newFollower', {
  media: {
    onsite: {}
  },
  message: {
    default: function (user) {
      return Blaze.toHTML(Blaze.With(this, function () {
        return Template.notificationNewFollower;
      }));  
    }
  },
  transform: {
    count: function () {
      return this.data.count;
    },
    follower: function () {
      return this.data.follower && this.data.follower.name;
    },
    profileUrl: function () {
      return this.data.follower && getProfileRoute(this.data.follower._id);
    }
  }
});

