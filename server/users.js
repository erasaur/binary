// Accounts.validateNewUser(function (user) {
// });
Accounts.onCreateUser(function (options, user) {
  var userProperties = {
    profile: options.profile || {},
    ipAddress: options.ipAddress,
    invites: {
      inviteCount: 3,
      invitedEmails: []
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

  var email = user.emails[0].address;
  if (!email) {
    throw new Meteor.Error('invalid-content', 'This content does not meet the specified requirements.');
  }

  var invite = Invites.findOne({ 'invitedEmail': email, 'accepted': false });
  if (invite) {
    // update the user who invited
    user.invites.invitedBy = invite.inviterId;
    // update the invite status to accepted
    Invites.update(invite._id, { $set: { 'accepted': true } });

    user.emails[0].verified = true;
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

  return user;
});

var sendWelcomeEmail = function (userId) {
  var user = userId && Meteor.users.findOne(userId);
  if (!user) return;

  var name = getDisplayName(user);
  var email = getEmail(user);
  var profileUrl = getProfileUrl(user._id);

  // notify admins
  var admins = Meteor.users.find({ 'isAdmin': true });
  admins.forEach(function (admin) {
    var properties = {
      name: name,
      actionLink: profileUrl
    };

    var adminEmail = admin.emails[0].address;
    Meteor.setTimeout(function () {
      buildAndSendEmail(adminEmail, 'A new user just joined Binary', 'emailNewUser', properties);
    }, 1);
  });

  // send welcome email
  Meteor.setTimeout(function () {
    buildAndSendEmail(email, i18n.t('email_welcome_subject'), 'emailWelcome', {
      greeting: i18n.t('greeting', name),
      message: [
        i18n.t('email_welcome_message_0'),
        i18n.t('email_welcome_message_1'),
        i18n.t('email_welcome_message_2')
      ]
    });
  }, 1);
};

Meteor.methods({
  newUser: function (email, name, password) {
    check([email, name, password], [String]);

    var name = stripHTML(name);
    if (!validName(name))
      throw new Meteor.Error('invalid-content', 'This content does not meet the specified requirements.');

    if (password.length < 6)
      throw new Meteor.Error('weak-password', 'This password must have at least 6 characters.');

    var userId = Accounts.createUser({
      'email': email,
      'password': password,
      'ipAddress': this.connection.clientAddress,
      'profile': {
        'name': name,
        'bio': i18n.t('default_profile')
      }
    });

    sendWelcomeEmail(userId);
  },
  newInvitedUser: function (name, password, inviteCode) {
    check([name, password, inviteCode], [String]);

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

    var userId = Accounts.createUser({
      'email': invite.invitedEmail,
      'password': password,
      'ipAddress': this.connection.clientAddress,
      'profile': {
        'name': name,
        'bio': i18n.t('default_profile')
      }
    });

    sendWelcomeEmail(userId);
    return invite.invitedEmail;
  },
  changeProfile: function (newName, newBio) {
    check([newName, newBio], [String]);

    if (!this.userId)
      throw new Meteor.Error('no-permission', i18n.t('please_login'));

    var query = { $set: { 'profile.name': newName, 'profile.bio': newBio } };
    Meteor.users.update(this.userId, query, function (error, result) {
      if (error) {
        // throw error.sanitizedError;
        throw error;
      }
    });
  },
  changeEmail: function (newEmail) {
    check(newEmail, String);

    if (!this.userId)
      throw new Meteor.Error('no-permission', i18n.t('please_login'));

    Meteor.users.update(this.userId, { $set: {
      'emails': [{ 'address': newEmail, 'verified': false }]
    }});
    Accounts.sendVerificationEmail(this.userId);
  },
  sendVerificationEmail: function () {
    if (!this.userId)
      throw new Meteor.Error('no-permission', i18n.t('please_login'));

    Accounts.sendVerificationEmail(this.userId);
  },
  // sendResetSuccessEmail: function () {
  //   var user = Meteor.user();
  //   if (!user) return;

  //   Meteor.setTimeout(function () {
  //     buildAndSendEmail(user.emails[0].address, 'Your password on Binary has been reset', 'emailResetSuccess', {
  //       name: user.profile.name,
  //       actionLink: ''
  //     });
  //   }, 1);
  // }
});



















