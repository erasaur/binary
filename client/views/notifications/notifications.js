Template.notifications.helpers({
  hasNotifications: function () {
    return !!Herald.collection.find({ 'userId': Meteor.userId() }, {
      fields: { '_id': 1 }, sort: { 'timestamp': -1 }
    }).count();
  },
  notifications: function () {
    return Herald.collection.find({ 'userId': Meteor.userId() }, {
      sort: { 'timestamp': -1 }
    });
  },
  notificationCount: function () {
    return Herald.collection.find({ 'userId': Meteor.userId(), 'read': false }, {
      fields: { 'read': 1 }
    }).count();
  }
});

