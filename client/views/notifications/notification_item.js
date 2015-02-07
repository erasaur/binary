Template.notificationItem.helpers({
  niceTime: function () {
    return moment(this.timestamp).fromNow();
  },
  notificationHTML: function () {
    return this.message();
  },
  readClass: function () {
    return this.read && 'read';
  }
});

Template.notificationItem.events({
  'click .notification-item': function (event, template) {
    var notificationId = this._id;

    Herald.collection.update(notificationId, {
      $set: { read: true }
    },
    function (error, result) {
      if (error) {
        console.log(error);
      }
    });
  }
});
