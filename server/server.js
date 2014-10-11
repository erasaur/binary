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