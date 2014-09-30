var userCategory = "Followers";
var userDeps = new Deps.Dependency();

Template.profileUsers.helpers({
  userCategory: function () {
    userDeps.depend();
    return userCategory;
  },
  users: function () {
    userDeps.depend();
    
    if (this.activity) {
      return userCategory === "Followers" ? 
        Meteor.users.find({"_id": {$in: this.activity.followers}}) : 
        Meteor.users.find({"_id": {$in: this.activity.following}});
    }
    return [];
  }
});

Template.profileUsers.events({
  "click li[role='presentation']": function (event, template) {
    userCategory = event.target.text;
    userDeps.changed();
  }
});


















