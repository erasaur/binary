Template.notifications.helpers({
  hasNotifications: function () {
    // if (Meteor.user() && Meteor.user().notifications)
    //   return Meteor.user().notifications.commentReply.length || 
    //          Meteor.user().notifications.followingUser.length || 
    //          Meteor.user().notifications.followingTopic.length;
  },
  notifications: function () {
    // if (Meteor.user() && Meteor.user().notifications) {
    //   var result = [];
    //   var notif = Meteor.user().notifications;

    //   result = notif.commentReply.concat(notif.followingUser);

    //   _.each(notif.followingTopic, function (obj) {
    //     if (obj.count) { //if the "count" attribute exists, we concatenate count to message: "55" + " users posted in topic"
    //       result.push({"url": obj.url, "message": obj.count + obj.message, "read": false});
    //     } else {
    //       result.push(obj); //otherwise, just add the array as is 
    //     }
    //   });

    //   return result;
    // }
  }
});