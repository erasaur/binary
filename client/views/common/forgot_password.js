Template.forgotPassword.helpers({
  'resetPassword': function () {
    return Session.get('resetPassword');
  }
});

Template.forgotPassword.events({
  'input input': function (event, template) {
    fadeElement($('.landing-form-errors'));
  },
  'submit #js-forgot-password-form': function (event, template) {
    event.preventDefault();
    var value = template.find('#js-forgot').value;

    if (!value) {
      template.find('.landing-form-errors').innerHTML = '<li>' + i18n.t('missing_fields') + '</li>';
      $('.landing-form-errors').fadeTo('slow', 1);
      return;
    }

    var token = Session.get('resetPassword');
    if (token) {
      Accounts.resetPassword(token, value, function (error) {
        if (error) {
          template.find('.landing-form-errors').innerHTML = '<li>' + i18n.t('error') + '</li>';
          $('.landing-form-errors').fadeTo('slow', 1);
        } else {
          Session.set('resetPassword', '');
          Meteor.call('emailResetPassword');
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
