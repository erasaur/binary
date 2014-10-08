Accounts.onCreateUser(function (options, user) {
  var userProperties = {
    profile: options.profile || {},
    stats: {
      reputation: 0,
      topicsCount: 0,
      commentsCount: 0,
      // isInvited: false,
      // invitedCount: 0,
    },
    activity: { // activity involving other users/collections
      upvotedComments: [],
      followers: [], 
      followingUsers: [], 
      followingTopics: [], 
      discussedTopics: []
    },
    notifications: {
      replies: [], // replies to our comments
      comments: [], // comments in our topics
      followers: [],
      followingUsers: { // users we are following
        comments: [], // new comments
        topics: [] // new topics
      }, 
      followingTopics: { // topics we are following
        comments: []
      }
    }
  };
  user = _.extend(user, userProperties);
  
  // set notifications default preferences
  user.profile.notifications = {
    enabled: true,
    followingUsers: { // users we are following
      comments: true, // new comments
      topics: true // new topics
    },
    followingTopics: { // topics we are following
      comments: true // new comments
    },
    replies: true, // replies to our comments
    comments: true, // comments in our topics
    followers: true // new followers
  };

  return user;
});

Meteor.methods({
  newUser: function (username, email, password) {   
    if (password.length < 6)
      throw new Meteor.Error("Your password must be at least 6 characters long.");
    else {
      Accounts.createUser({
        "username": username, 
        "email": email, 
        "password": password,
        "profile": {
          "name": "No name",
          "bio": "Not much is known about him/her, except that not much is known about him/her."
        }
      });
      return "Success! Your account '" + username + "' has been created.";
    }
  },
  changeName: function (newName) {
    Meteor.users.update(Meteor.userId(), { $set: { 'profile.name': newName } });
  },
  changeBio: function (newBio) {
    Meteor.users.update(Meteor.userId(), { $set: { 'profile.bio': newBio } });
  },
  changeEmail: function (newEmail) {
    Meteor.users.update(Meteor.userId(), { $set: { 
      'emails': [{ 'address': newEmail, 'verified': false }]
    } });
  },
  changePreferences: function (newPreferences) {
    Meteor.users.update(Meteor.userId(), { $set: newPreferences });
  },
  newNotification: function(type, userId, options) {
    // var  name = getDisplayNameById(userId);

    // if (type === "newComment") {
    //  var topicTitle = Topics.findOne(options.topicId).title;
    //  var notobj = {"url": "/topics/" + options.topicId + "#" + options.commentId, 
    //                "message": name + " replied to your comment in '" + topicTitle + "'", 
    //                "read": false};
    //  var notif;

    //  //"user replied to your comment"
    //  if (options.replyTo && options.replyTo !== userId) { //if reply to self, no notification
    //    notif = Meteor.users.findOne(options.replyTo).notifications;

    //    if (notif.commentReply.length >= 5) {
    //      Meteor.users.update(options.replyTo, 
    //                         {$pop: {"notifications.commentReply": -1}}); //pop the last item of array
    //    }

    //    Meteor.users.update(options.replyTo, 
    //                       {$addToSet: {"notifications.commentReply": notobj}});
    //  }

    //  //"user has posted a new comment in topic"
    //  var followers = Meteor.users.findOne(userId).activity.followers; 
    //  notobj.message = name + " posted a new comment in '" + topicTitle + "'";

    //  //notify poster's followers of his new comment
    //  _.each(followers, function (id) {
    //    if(id !== options.replyTo) { //if it's not the replyTo user (whom we should've already notified)
    //      Meteor.users.update(id, {$addToSet: {"notifications.followingUser": notobj}});
    //    }
    //  });

    //  var topicFollowers = [];
    //  Meteor.users.find({"activity.followingTopics": options.topicId}).forEach(function (user) {
    //    if(user._id !== options.replyTo && user._id !== userId) {
    //      topicFollowers.push(user._id);
    //    }
    //  });

    //  notobj.url = "/topics/" + options.topicId;
    //  notobj.message = "A new comment was posted in '" + topicTitle + "'";
      
    //  // notify people who are following the topic in which there is the new comment, 
    //  // but not if they have already been notified via the user whom they are following
    //  _.each(_.difference(topicFollowers, followers), function (id) {
    //    // "a new comment has been posted in topic"
    //    var currUrl = "/topics/" + options.topicId; //url for this notification

    //    // check if a notification entry already has this url
    //    notif = _.find(Meteor.users.findOne(id).notifications.followingTopic, function (obj) { 
    //      return obj.url === currUrl; 
    //    }); 

    //    //if this topic already has more than one notification entry with the url, combine them all into one with a "count" 
    //    if(notif) { //if this topic already has one entry
    //      if(notif.count) {
    //        Meteor.users.update({"_id": id, "notifications.followingTopic": {$elemMatch: {"url": currUrl}}}, 
    //                            {$inc: {"notifications.followingTopic.$.count": 1}});
    //      } else {
    //        notobj.count = 2;
    //        notobj.message = " new comments were posted in '" + topicTitle + "'";
    //        Meteor.users.update(id, {$pull: {"notifications.followingTopic": {"url": currUrl}}});
    //        Meteor.users.update(id, {$push: {"notifications.followingTopic": notobj}}); 
    //      }
    //    } 
    //    //"count" is still low, so just add it as usual, as a normal notification entry
    //    else
    //      Meteor.users.update(id, {$addToSet: {"notifications.followingTopic": notobj}});
    //  });
    // } else if (type === "newTopic") {
    //  _.each(Meteor.users.findOne(userId).activity.followers, function (id) {
    //    Meteor.users.update(id, {$addToSet: {"notifications.followingUser": 
    //      {"url": "/topics/" + options.topicId, "message": name + " created the new topic '" + options.topicTitle + "'"}}});
    //  });
    // }
  },
});
  


















