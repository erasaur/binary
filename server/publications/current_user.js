// Publish current user

Meteor.publish('currentUser', function () {
  if (!canViewById(this.userId)) return this.ready(); 

  return Meteor.users.find(this.userId, { 
    fields: { 'invites': 1, 'email_hash': 1, 'stats': 1, 'activity': 1, 'isAdmin': 1 } 
  });
});