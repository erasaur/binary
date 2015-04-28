Template.forgotPassword.helpers({
  'resetPassword': function () {
    return Session.get('resetPassword');
  }
});

Template.forgotPassword.events({
  'submit #js-forgot-password-form': function (event, template) {
    event.preventDefault();
    var value = template.find('#js-forgot').value;

    if (!value) {
      toastr.warning(i18n.t('missing_fields'));
      return;
    }

    var token = Session.get('resetPassword');
    if (token) {
      Accounts.resetPassword(token, value, function (error) {
        if (error) {
          toastr.warning(i18n.t('error'));
        } else {
          Session.set('resetPassword');
          Router.go('home');
        }
      });
    } else {
      Accounts.forgotPassword({ email: value }, function () {
        toastr.success(i18n.t('check_email_for_recovery'));
        Router.go('landing');
      });
    }
  }
});
