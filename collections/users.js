var Schema = {};

Schema.User = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  username: {
    type: String,
    min: 3,
    regEx: /^[a-z0-9A-Z_]{3,15}$/
  },
  emails: {
    type: [Object]
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  "emails.$.verified": {
    type: Boolean
  },
  createdAt: {
    type: Date
  },
  stats: { // public but not modifiable
    type: Object,
    optional: true,
    blackbox: true
  },
  profile: { // public and modifiable
    type: Object,
    optional: true,
    blackbox: true
  },
  activity: { // public but not modifiable
    type: Object,
    optional: true,
    blackbox: true
  },
  notifications: { // public but not modifiable
    type: Object,
    optional: true,
    blackbox: true
  },
  services: {
    type: Object,
    blackbox: true
  }
});

Meteor.users.attachSchema(Schema.User);

// Meteor.users.deny({
//   update: function(userId, post, fieldNames) {
//     if(isAdminById(userId))
//       return false;
//     // deny the update if it contains something other than the profile field
//     return (_.without(fieldNames, 'profile').length > 0);
//   }
// });

// Meteor.users.allow({
//   update: function(userId, doc){
//     return isAdminById(userId) || userId == doc._id;
//   },
//   remove: function(userId, doc){
//     return isAdminById(userId) || userId == doc._id;
//   }
// });

Meteor.users.initEasySearch("username", {
	"limit": 20,
	"use": "mongo-db"
});















