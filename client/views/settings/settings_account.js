var changingPassword = new ReactiveVar(false);

Template.settingsAccount.events({
  'click #js-email-verification': function (event, template) {
    Meteor.call('sendVerificationEmail', function (error) {
      if (error)
        alert(formatError(error))
      else
        alert('Please check your email for a verification link. Thanks!');
    });
  },
  'click #js-edit-password': function () {
    changingPassword.set(true);
  },
  'click #js-cancel-edit': function (event, template) {
    template.$('#js-password').val('');
    template.$('#js-newPassword').val('');
    changingPassword.set(false);
  }
});

Template.settingsAccount.helpers({
  changingPassword: function () {
    return changingPassword.get();
  }
});