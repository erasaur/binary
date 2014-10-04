Template.errorItem.created = function () {
  var errorId = this.data._id;

  Meteor.setTimeout(function () {
    Errors.update(errorId, {$set: {seen: true}});
  }, 100);
};