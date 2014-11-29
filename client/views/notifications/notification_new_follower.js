Template.notificationNewFollower.helpers({
  hasCount: function () {
    return this.data.count;
  },
  count: function () {
    return this.data.count - 1;
  },
  follower: function () {
    var follower = this.data.follower;
    return follower && follower.name;
  }
});