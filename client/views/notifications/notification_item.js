Template.notificationItem.helpers({
  niceTime: function () {
    return moment(this.timestamp).fromNow();
  },
  notificationHTML: function () {
    console.log(this.message())
    return this.message();
  }
});

Template.notificationItem.events({
  'click .action-link': function (event, template) {
    var notificationId = template.data._id;

    Herald.collection.update({ _id: notificationId }, {
      $set: { read: true }
    },
    function (error, result) {
      if (error) {
        console.log(error);
      } 
    });  
  }
});