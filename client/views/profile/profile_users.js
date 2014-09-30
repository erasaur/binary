Template.profileUsers.helpers({
  following: function () {
    return this.activity && Meteor.users.find({"_id": {$in: this.activity.following}});
  },
  followers: function () {
    return this.activity && Meteor.users.find({"_id": {$in: this.activity.followers}});
  }
});