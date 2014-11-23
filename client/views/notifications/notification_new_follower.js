Template.notificationNewFollower.helpers({
  count: function () {
    return this.data.count;
  },
  follower: function () {
    var follower = this.data.follower;
    return follower && { 
      'name': follower.name, 
      'url': getProfileRoute(follower._id) 
    };
  }
});
  