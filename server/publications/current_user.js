// Publish current user

Meteor.publish('currentUser', function () {
  return Meteor.users.find(this.userId, { 
    fields: { 'invites': 1, 'email_hash': 1, 'stats': 1, 'activity': 1 } 
  });
});