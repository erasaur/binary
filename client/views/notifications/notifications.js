Template.notifications.helpers({
  hasNotifications: function () {
    return !!Herald.collection.find({ 'userId': Meteor.userId(), 'read': false }, {
      sort: { timestamp: -1 }
    }).count();
  },
  notifications: function () {
    return Herald.collection.find({ 'userId': Meteor.userId(), 'read': false }, {
      sort: { timestamp: -1 }
    });
  },
  notificationCount: function () {
    return Herald.collection.find({ 'userId': Meteor.userId(), 'read': false }).count();
  }
});

