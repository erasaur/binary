var Schema = {};

Schema.UserProfileNotifications = new SimpleSchema({
  enabled: { // enable notifications
    type: Boolean
  },
  comments: { // new comments in own topic
    type: Boolean
  },
  replies: { // new replies to own comments
    type: Boolean
  },
  followers: { // new followers
    type: Boolean
  },
  "followingTopics.comments": { // new comments in following topics
    type: Boolean
  },
  "followingUsers.comments": { // new comments by following users
    type: Boolean
  },
  "followingUsers.topics": { // new topics by following users
    type: Boolean
  }
});

Schema.UserProfile = new SimpleSchema({
  name: {
    type: String,
    regEx: /^([a-zA-Z]+(\s{0,1})[a-zA-Z0-9.'-]+(\s{0,1})[a-zA-Z0-9.'-]*){3,25}$/
  },
  bio: {
    type: String,
    optional: true
  },
  notifications: {
    type: Schema.UserProfileNotifications,
    optional: true
  }
});

Schema.User = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  username: {
    type: String,
    regEx: /^[a-z0-9A-Z_]{3,15}$/
  },
  emails: {
    type: [Object],
    optional: true
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
    type: Schema.UserProfile
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















