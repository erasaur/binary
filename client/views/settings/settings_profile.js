Template.settingsProfile.helpers({
  settingsTitle: function () {
    return i18n.t('edit_profile');
  }
});

Template.settingsProfile.events({
  'submit form': function (event, template) {
    var name = template.find('#js-name').value;
    var bio = template.find('#js-bio').value;

    Meteor.call('changeProfile', name, bio, function (error, result) {
      if (error) {
        console.log(error.invalidKeys);
        alert(i18n.t('use_valid_characters'));
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
