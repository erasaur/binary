// Publish current user

Meteor.publish("currentUser", function () {
  return Meteor.users.find(this.userId, {fields: {"activity": 1, "notifications": 1}});
});