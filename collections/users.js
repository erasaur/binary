// schema --------------------------------------------

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

// end schema ----------------------------------------


// search --------------------------------------------

Meteor.users.initEasySearch("username", {
  "limit": 20,
  "use": "mongo-db"
});

// end search ----------------------------------------


// permissions ---------------------------------------

Meteor.users.deny({
  update: function (userId, user, fields) {
    // if(isAdminById(userId)) return false;

    // deny the update if it contains something other than the profile field
    return (_.without(fields, 'profile').length > 0);
  }
});

Meteor.users.allow({
  update: function (userId, user) {
    // return isAdminById(userId) || userId == user._id;
    return userId == user._id;
  },
  remove: function (userId, user) {
    // return isAdminById(userId) || userId == user._id;
    return userId = user._id;
  }
});

// end permissions -----------------------------------


// methods -------------------------------------------

Meteor.methods({
  newFollower: function (following) {
    var userId = this.userId;

    if (!userId || !canFollowById(userId))
      throw new Meteor.Error(403, 'Please login to follow other users.');

    // update user being followed
    Meteor.users.update(userId, { 
      $addToSet: { 'activity.followingUsers': following } 
    });

    // update the user who is following
    Meteor.users.update(following, { 
      $addToSet: { 'activity.followers': userId },
      $inc: { 'stats.followersCount': 1 } 
    });
  },
  removeFollower: function (following) {
    var userId = this.userId;

    if (!userId || !canFollowById(userId))
      throw new Meteor.Error(403, 'Please login to follow other users.');

    // update user being followed
    Meteor.users.update(userId, {
      $pull: { 'activity.followingUsers': following } 
    });

    // update the user who is following
    Meteor.users.update(following, { 
      $pull: { 'activity.followers': userId },
      $inc: { 'stats.followersCount': -1 } 
    });
  }
});

// end methods ---------------------------------------








