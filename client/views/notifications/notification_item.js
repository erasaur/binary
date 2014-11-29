Template.notificationItem.helpers({
  niceTime: function () {
    return moment(this.timestamp).fromNow();
  },
  notificationHTML: function () {
    console.log(this);
    return this.message();
  }
});

Template.notificationItem.events({
  'click .action-link': function (event, template) {
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