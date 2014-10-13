// Herald.collection.deny({
//   update: !canEditById,
//   remove: !canEditById
// });

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
    author: function () {
      return this.data.author.name;
    },
    profileUrl: function () {
      return getProfileRoute(this.data.author._id);
    },
    topicTitle: function () {
      return this.data.topic.title;
    },
    topicUrl: function () {
      return getTopicRoute(this.data.topic._id);
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
    follower: function () {
      return this.data.follower.name;
    },
    profileUrl: function () {
      return getProfileRoute(this.data.follower._id);
    }
  }
});

