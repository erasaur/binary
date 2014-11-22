Template.profileItem.helpers({
  canFollow: function () {
    return canFollow(Meteor.user(), this._id);
  },
  followClass: function () {
    var user = Meteor.user();
    if (!user || !user.activity)
      return 'js-follow';

    return _.contains(user.activity.followingUsers, this._id) ? 
      'js-unfollow following' : 'js-follow';
  }
});

Template.profileItem.events({
  'click .js-follow': function (event, template) {
    Meteor.call('newFollower', this._id);
  },
  'click .js-unfollow': function (event, template) {
    Meteor.call('removeFollower', this._id);
  }
});