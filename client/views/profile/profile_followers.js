Template.profileFollowers.helpers({
  followers: function () {
    return this.activity && Meteor.users.find({'_id': {$in: this.activity.followers}});
  }
});