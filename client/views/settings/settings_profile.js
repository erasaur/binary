Template.settingsProfile.events({
  'submit form': function (event, template) {
    var name = template.find('#js-name').value;
    var bio = template.find('#js-bio').value;

    Meteor.call('changeProfile', name, bio, function (error, result) {
      if (error) {
        console.log(error.invalidKeys);
        alert('Sorry, please try to stick to alphanumeric characters, hyphens, periods, and apostrophes!')
      }
    });
  },
  'click #js-cancel-edit': function (event, template) {
    var user = Meteor.user();
    if (!user) return;
    template.$('#js-name').val(user.profile.name);
    template.$('#js-bio').val(user.profile.bio);
  }
});