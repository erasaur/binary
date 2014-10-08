Template.profileItem.helpers({
  following: function () {
    if (Meteor.user() && Meteor.user().activity)
    return Meteor.user().activity.followingUsers.indexOf(this._id) > -1;
  }
})