Accounts.onCreateUser(function (options, user) {
  var userProperties = {
    profile: options.profile || {},
    stats: {
      reputation: 0,
      topicsCount: 0,
      commentsCount: 0,
      followersCount: 0,
      inviteCount: 3
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
  if (email)
    user.email_hash = Gravatar.hash(email);
  
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
  newUser: function (email, password) {   
    if (password.length < 6)
      throw new Meteor.Error('Your password must be at least 6 characters long.');
    else {
      Accounts.createUser({
        'email': email, 
        'password': password,
        'profile': {
          'name': 'Anonymous',
          'bio': 'Not much is known about him/her, except that not much is known about him/her.'
        }
      });
      return 'Success! Your account has been created. Please check your email for a confirmation link!';
    }
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
  


















