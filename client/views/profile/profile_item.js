Template.profileItem.helpers({
  canFollow: function () {
    return Meteor.userId() && this._id != Meteor.userId();
  },
  following: function () {
    if (Meteor.user() && Meteor.user().activity)
      return Meteor.user().activity.followingUsers.indexOf(this._id) > -1;
  }
});

Template.profileItem.events({
  'click #js-follow': function (event, template) {
    Meteor.call('newFollower', this._id);
  },
  'click #js-unfollow': function (event, template) {
    Meteor.call('removeFollower', this._id);
  }
});