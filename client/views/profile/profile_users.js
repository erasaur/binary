var userCategory = 'Followers';
var userDeps = new Deps.Dependency();

Template.profileUsers.helpers({
  userCategory: function () {
    userDeps.depend();
    return userCategory;
  },
  users: function () {
    userDeps.depend();
    
    if (userCategory === 'Followers')
      return this.activity && Meteor.users.find({'_id': {$in: this.activity.followers}}) || [];

    else
      return this.activity && Meteor.users.find({'_id': {$in: this.activity.followingUsers}}) || [];
  }
});

Template.profileUsers.events({
  'click li[role="presentation"]': function (event, template) {
    userCategory = event.currentTarget.getAttribute('data-category');
    userDeps.changed();
  }
});


















