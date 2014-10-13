Template.profileFollowing.helpers({
  following: function () {
    return this.activity && Meteor.users.find({ '_id': {
      $in: this.activity.followingUsers
    } });
  }
});