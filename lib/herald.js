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
    count: function () {
      return this.data.count;
    },
    author: function () {
      var author = this.data.author;
      return author && { name: author.name, url: getProfileRoute(author._id) };
    },
    topic: function () {
      var topic = this.data.topic;
      return topic && { title: topic.title, url: getTopicRoute(topic._id) };
    },
    commentUrl: function () {
      var topic = this.data.topic;
      var comment = this.data.comment;
      return topic && comment && getTopicRoute(topic._id) + '#' + comment._id;
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
    count: function () {
      return this.data.count;
    },
    author: function () {
      var author = this.data.author;
      return author && { name: author.name, url: getProfileRoute(author._id) };
    },
    replyToUrl: function () {
      return getTopicRoute(this.data.replyTo.topicId) + '#' + this.data.replyTo._id;
    },
    topicTitle: function () {
      return this.data.topic && this.data.topic.title;
    },
    commentUrl: function () {
      var topic = this.data.topic;
      var comment = this.data.comment;
      return topic && comment && getTopicRoute(topic._id) + '#' + comment._id;
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
    author: function () {
      var author = this.data.author;
      return author && { name: author.name, url: getProfileRoute(this.data.author._id) };
    },
    topic: function () {
      var topic = this.data.topic;
      return topic && { title: topic.title, url: getTopicRoute(topic._id) };
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
      var follower = this.data.follower;
      return follower && { name: follower.name, url: getProfileRoute(follower._id) };
    }
  }
});

