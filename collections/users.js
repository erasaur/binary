// schema --------------------------------------------

var Schema = {};

Schema.UserProfile = new SimpleSchema({
  name: {
    type: String,
    regEx: /^([a-zA-Z]+(\s{0,1})[a-zA-Z0-9.'-]+(\s{0,1})[a-zA-Z0-9.'-]*){3,25}$/
  },
  bio: {
    type: String,
    max: 100,
    optional: true
  },
  notifications: {
    type: Object,
    optional: true,
    blackbox: true
  }
});

Schema.UserStats = new SimpleSchema({
  commentsCount: {
    type: Number,
    min: 0
  },
  followersCount: {
    type: Number,
    min: 0
  },
  reputation: {
    type: Number,
    min: 0 // possibly negative if we have downvotes ?
  },
  topicsCount: {
    type: Number,
    min: 0
  },
  inviteCount: {
    type: Number,
    min: 0
  }
});

Schema.User = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  emails: {
    type: [Object],
    optional: true
  },
  'emails.$.address': {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  'emails.$.verified': {
    type: Boolean
  },
  email_hash: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date
  },
  stats: { // public but not modifiable
    type: Schema.UserStats,
    optional: true
  },
  profile: { // public and modifiable
    type: Schema.UserProfile
  },
  activity: { // public but not modifiable
    type: Object,
    optional: true,
    blackbox: true
  },
  services: {
    type: Object,
    blackbox: true
  }
  // ,
  // roles: {
  //   type: Object,
  //   optional: true,
  //   blackbox: true
  // }
});

Meteor.users.attachSchema(Schema.User);

// end schema ----------------------------------------


// search --------------------------------------------

Meteor.users.initEasySearch('profile.name', {
  'limit': 15,
  'use': 'mongo-db'
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
  newFollower: function (followingId) {
    var userId = this.userId;

    if (!userId || !canFollowById(userId))
      throw new Meteor.Error(403, 'Please login to follow other users.');

    // update user being followed
    Meteor.users.update(userId, { 
      $addToSet: { 'activity.followingUsers': followingId } 
    });

    // update the user who is following
    Meteor.users.update(followingId, { 
      $addToSet: { 'activity.followers': userId },
      $inc: { 'stats.followersCount': 1 } 
    });

    Meteor.call('newFollowerNotification', followingId);
  },
  removeFollower: function (followingId) {
    var userId = this.userId;

    if (!userId || !canFollowById(userId))
      throw new Meteor.Error(403, 'Please login to follow other users.');

    // update user being followed
    Meteor.users.update(userId, {
      $pull: { 'activity.followingUsers': followingId } 
    });

    // update the user who is following
    Meteor.users.update(followingId, { 
      $pull: { 'activity.followers': userId },
      $inc: { 'stats.followersCount': -1 } 
    });
  }
});

// end methods ---------------------------------------








