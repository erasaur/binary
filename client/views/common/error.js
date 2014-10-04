Template.error.helpers({
  errors: function () {
    return Errors.find({show: true});
  }
});