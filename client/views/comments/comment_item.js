Template.commentItem.helpers({
  author: function () {
    return Meteor.users.findOne(this.userId);
  }
});