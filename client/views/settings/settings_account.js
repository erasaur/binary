function changeEmail (email) {
  var user = Meteor.user();
  if (!user) return;

  var currentEmail = user.emails[0].address;
  if (currentEmail === email) return;

  Meteor.call('changeEmail', email, function (error, result) {
    if (error) {
      throw 'Oops, something went wrong. Please try again later.';
    } else {
      alert('Please check your email for a verification link. Thanks!');
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
  changingPassword: function () {
    return changingPassword.get();
  }
});

Template.settingsAccount.events({
  'click #js-email-verification': function (event, template) {
    Meteor.call('sendVerificationEmail', function (error) {
      if (error)
        alert(formatError(error))
      else
        alert('Please check your email for a verification link. Thanks!');
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
        alert(e);
      }
    }

    var oldPassword = template.find('#js-password').value;
    var newPassword = template.find('#js-newPassword').value;

    if (newPassword.length < 6) {
      alert('Your password must be at least 6 characters long.');
      $('#js-newPassword').trigger('focus');
      return;
    }
    
    Accounts.changePassword(oldPassword, newPassword, function (error) {
      if (error) {
        alert('Please verify that you have entered the correct password.');
        $('#js-password').trigger('focus');
        return;
      } else {
        try {
          changeEmail(email);
          stopEditing(template);
        } catch (e) {
          alert(e);
        }
      }
    });
  }
});