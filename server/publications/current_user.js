// Publish current user

Meteor.publish("currentUser", function () {
  return Meteor.users.find(this.userId, {fields: {"stats": 1, "activity": 1, "notifications": 1}});
});