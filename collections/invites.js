InviteSchema = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  inviterId: {
    type: String
  },
  invitedEmail: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  inviteCode: {
    type: String
  },
  accepted: {
    type: Boolean
  }
});

Invites = new Mongo.Collection('invites');
Invites.attachSchema(InviteSchema);

Invites.deny({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; }
});