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
  }
});

