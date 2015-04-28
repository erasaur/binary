Template.signupModal.created = function () {
  this._showLogin = new ReactiveVar(false);
};

Template.signupModal.helpers({
  showLogin: function () {
    var template = Template.instance();
    return template._showLogin && template._showLogin.get();
  }
});

Template.signupModal.events({
  'click #js-show-signup': function (event, template) {
    template._showLogin && template._showLogin.set(false);
  },
  'click #js-show-login': function (event, template) {
    template._showLogin && template._showLogin.set(true);
  }
});

Template.signupForm.events({
  'submit #js-signup-form': function (event, template) {
    event.preventDefault();

    var email = template.find('#js-create-email').value;
    var name = template.find('#js-create-name').value;
    var password = template.find('#js-create-password').value;

    Meteor.call('newUser', email, name, password, function (error, result) {
      if (error) {
        if (error.error === 'invalid-content') {
          toastr.warning(i18n.t('use_alphanumeric_name'));
        }
        else if (error.error === 'weak-password') {
          toastr.warning(i18n.t('password_too_short'));
        }
        else {
          toastr.warning(i18n.t('error'));
        }
      } else {
        Meteor.loginWithPassword(email, password, function (error) {
          if (error) toastr.warning(i18n.t('error'));
        });
      }
    });
  }
});
