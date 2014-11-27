// schema --------------------------------------------

var Schema = {};

Schema.UserInvites = new SimpleSchema({
  inviteCount: {
    type: Number,
    min: 0,
    optional: true
  },
  invitedEmails: {
    type: [String],
    optional: true
  },
  invitedBy: {
    type: String,
    optional: true
  }
});

Schema.UserProfile = new SimpleSchema({
  name: {
    type: String,
    regEx: /^([a-zA-Z]+[a-zA-Z0-9.'-\s]*){3,25}$/
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
  isAdmin: {
    type: Boolean,
    optional: true
  },
  email_hash: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date
  },
  invites: {
    type: Schema.UserInvites,
    optional: true
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
});

Meteor.users.attachSchema(Schema.User);

// end schema ----------------------------------------


// permissions ---------------------------------------

Meteor.users.deny({
  update: function (userId, user, fields) {
    if(isAdminById(userId)) return false;

    // deny the update if it contains something other than the profile field
    return (_.without(fields, 'profile').length > 0);
  }
});

Meteor.users.allow({
  // update: function (userId, user) {
  //   return isAdminById(userId) || userId == user._id;
  // },
  // remove: function (userId, user) {
  //   return isAdminById(userId) || userId == user._id;
  // }
  update: canEditById,
  remove: canEditById
});

// end permissions -----------------------------------


// methods -------------------------------------------

Meteor.methods({
  newFollower: function (followingId) {
    var userId = this.userId;

    if (!userId || !canFollowById(userId))
      throw new Meteor.Error('logged-out', 'This user must be logged in to continue.');

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
      throw new Meteor.Error('logged-out', 'This user must be logged in to continue.');

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








