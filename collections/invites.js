InviteSchema = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  invitingUserId: {
    type: String,
    optional: true
  },
  invitedUserEmail: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  accepted: {
    type: Boolean,
    optional: true
  }
});

Invites = new Mongo.Collection('invites');
Invites.attachSchema(InviteSchema);

Invites.deny({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});