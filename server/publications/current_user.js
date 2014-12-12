// Publish current user

Meteor.publish('currentUser', function () {
  if (!this.userId) return this.ready(); 

  var fields = { 
    'invites': 1, 
    'email_hash': 1, 
    'stats': 1, 
    'activity': 1, 
    'isAdmin': 1,
    'flags': 1
  }; 
  return Meteor.users.find(this.userId, { fields: fields });
});