Template.profileItem.helpers({
  canFollow: function () {
    return canFollow(Meteor.user(), this._id);
  },
  iconClass: function () {
    var user = Meteor.user();
    var follow = {
      'follow': 'js-follow',
      'icon': 'b-icon-plus'
    };
    var unfollow = {
      'follow': 'js-unfollow following',
      'icon': 'b-icon-check'
    };

    if (!user || !user.activity || !_.contains(user.activity.followingUsers, this._id))
      return follow;

    return unfollow;
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