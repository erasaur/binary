Template.profileUsers.helpers({
  following: function () {
    if (this.user && this.user.activity)
      return Meteor.users.find({"_id": {$in: this.user.activity.following}});
    return [];
  },
  followers: function () {
    if (this.user && this.user.activity)
      return Meteor.users.find({"_id": {$in: this.user.activity.followers}});
    return [];
  }
});