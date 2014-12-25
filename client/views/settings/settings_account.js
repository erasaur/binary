function changeEmail (email) {
  var user = Meteor.user();
  if (!user) return;

  var currentEmail = user.emails[0].address;
  if (currentEmail === email) return;

  Meteor.call('changeEmail', email, function (error, result) {
    if (error) {
      throw i18n.t('error');
    } else {
      toastr.success(i18n.t('check_email_for_verification'));
    }
  });
}

function stopEditing (template) {
  var user = Meteor.user();
  if (!user) return;
  template.$('#js-email').val(user.emails[0].address);
  template.$('#js-password').val('');
  template.$('#js-newPassword').val('');
  changingPassword.set(false);
}

var changingPassword = new ReactiveVar(false);

Template.settingsAccount.helpers({
  settingsTitle: function () {
    return i18n.t('account_settings');
  },
  changingPassword: function () {
    return changingPassword.get();
  }
});

Template.settingsAccount.events({
  'click #js-email-verification': function (event, template) {
    Meteor.call('sendVerificationEmail', function (error) {
      if (error)
        toastr.warning(i18n.t('error'));
      else
        toastr.success(i18n.t('check_email_for_verification'));
    });
  },
  'click #js-edit-password': function (event, template) {
    changingPassword.set(true);
  },
  'click #js-cancel-edit': function (event, template) {
    stopEditing(template);
  },
  'submit form': function (event, template) {
    var email = template.find('#js-email').value;

    if (!changingPassword.get()) {
      try {
        changeEmail(email);
        return;
      } catch (e) {
        toastr.warning(e);
      }
    }

    var oldPassword = template.find('#js-password').value;
    var newPassword = template.find('#js-newPassword').value;

    if (newPassword.length < 6) {
      toastr.warning(i18n.t('password_too_short'));
      $('#js-newPassword').focus();
      return;
    }

    Accounts.changePassword(oldPassword, newPassword, function (error) {
      if (error) {
        toastr.warning(i18n.t('incorrect_password'));
        $('#js-password').focus();
        return;
      } else {
        try {
          changeEmail(email);
          stopEditing(template);
        } catch (e) {
          toastr.warning(e);
        }
      }
    });
  }
});
