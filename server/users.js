Accounts.onCreateUser(function (options, user) {
  var userProperties = {
    profile: options.profile || {},
    invites: {
      inviteCount: 3,
      invitedEmails: []  
    },
    stats: {
      reputation: 0,
      topicsCount: 0,
      commentsCount: 0,
      followersCount: 0
    },
    activity: { // activity involving other users/collections
      upvotedComments: [],
      followers: [], 
      followingUsers: [], 
      followingTopics: [], 
      discussedTopics: []
    }
  };
  // add default properties
  user = _.extend(user, userProperties);

  // add email hash
  var email = user.emails[0].address;
  if (email) {
    user.email_hash = Gravatar.hash(email);

    var invite = Invites.findOne({ 'invitedEmail': email });
    user.invites.invitedBy = invite && invite.inviterId;
  }
  
  // set notifications default preferences
  user.profile.notifications = {
    media: {
      onsite: true
    },
    couriers: {
      newTopic: {
        onsite: true
      },
      newComment: {
        onsite: true, // enable comment notifications at all
        topicOwner: {
          onsite: true // notify user of comments if he is the topic owner
        },
        topicFollower: {
          onsite: true // notify user if he is topic follower
        },
        follower: {
          onsite: true // notify user of another's comments if he is a follower
        }
      },
      newReply: {
        onsite: true
      },
      newFollower: {
        onsite: true
      }
    }
  };

  return user;
});

Meteor.methods({
  newUser: function (name, password, inviteCode) {
    var name = stripHTML(name);

    var invite = {
      inviteCode: inviteCode,
      accepted: false
    };
    invite = Invites.findOne(invite);

    if (!invite)
      throw new Meteor.Error('invalid-invite', 'This invitation does not match any existing invitations.');

    if (!validName(name))
      throw new Meteor.Error('invalid-content', 'This content does not meet the specified requirements.');

    if (password.length < 6)
      throw new Meteor.Error('weak-password', 'This password must have at least 6 characters.');

    Accounts.createUser({
      'email': invite.invitedEmail, 
      'password': password,
      'profile': {
        'name': name,
        'bio': 'Not much is known about him/her, except that not much is known about him/her.'
      }
    });
  },
  changeName: function (newName) {
    Meteor.users.update(Meteor.userId(), { $set: { 'profile.name': newName } });
  },
  changeBio: function (newBio) {
    Meteor.users.update(Meteor.userId(), { $set: { 'profile.bio': newBio } });
  },
  changeEmail: function (newEmail) {
    Meteor.users.update(Meteor.userId(), { 
      $set: { 
        'emails': [{ 'address': newEmail, 'verified': false }], 
        'email_hash': Gravatar.hash(newEmail)
      } // send verification email ?
    });
  },
  changePreferences: function (newPreferences) {
    Meteor.users.update(Meteor.userId(), { $set: newPreferences });
  }
});
  


















