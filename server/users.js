// Accounts.validateNewUser(function (user) { 
// });
Accounts.onCreateUser(function (options, user) {
  var userProperties = {
    profile: options.profile || {},
    isAdmin: false,
    invites: {
      inviteCount: 3,
      invitedEmails: []  
    },
    stats: {
      reputation: 0,
      flagsCount: 0, // helpful flags
      topicsCount: 0,
      commentsCount: 0,
      followersCount: 0,
    },
    flags: {
      comments: [],
      topics: []
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

    // update the user who invited 
    user.invites.invitedBy = invite && invite.inviterId;
    // update the invite status to accepted
    Invites.update(invite._id, { $set: { 'accepted': true } });
  }
  
  // set notifications default preferences
  user.profile.notifications = {
    media: {
      onsite: true,
      email: true
    },
    couriers: {
      newTopic: {
        onsite: true,
        email: true
      },
      newComment: {
        topicOwner: {
          onsite: true, // notify user of comments if he is the topic owner
          email: true
        },
        topicFollower: {
          onsite: true, // notify user if he is topic follower
          email: true
        },
        follower: {
          onsite: true, // notify user of another's comments if he is a follower
          email: true
        }
      },
      newReply: {
        onsite: true,
        email: true
      },
      newFollower: {
        onsite: true,
        email: true
      }
    }
  };

  // notify admins
  var admins = Meteor.users.find({ 'isAdmin': true });
  admins.forEach(function (admin) {
    var properties = {
      name: getDisplayName(user),
      actionLink: getProfileUrl(user._id)
    };

    var email = admin.emails[0].address;
    buildAndSendEmail(email, 'A new user just joined Binary', 'emailNewUser', properties);
  });

  // subscribe user to newsletter

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

    return invite.invitedEmail;
  },
  changeProfile: function (newName, newBio) {
    Meteor.users.update(Meteor.userId(), { 
      $set: { 'profile.name': newName, 'profile.bio': newBio } 
    });
  },
  changeEmail: function (newEmail) {
    Meteor.users.update(Meteor.userId(), { 
      $set: { 
        'emails': [{ 'address': newEmail, 'verified': false }], 
        'email_hash': Gravatar.hash(newEmail)
      }
    });
    Accounts.sendVerificationEmail(Meteor.userId());
  },
  sendVerificationEmail: function () {
    Accounts.sendVerificationEmail(Meteor.userId());
  }
});
  


















