if (Meteor.users.find().count() === 0) {
  Accounts.createUser({
    email: 'mmaarrkklleeee@gmail.com',
    password: 'asdf123',
    profile: {
      name: 'Mark Lee',
      bio: 'Big boss',
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

    },
    isAdmin: true,
    invites: {
      inviteCount: 100000,
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
  });
}
