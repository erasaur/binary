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

    if (value) {
      if (Session.get('resetPassword')) {
        Accounts.resetPassword(Session.get('resetPassword'), value, function (error) {
          Session.set('resetPassword', '');
          if (error) {
            template.find('.landing-form-errors').innerHTML = '<li>' + formatError(error) + '</li>';
            $('.landing-form-errors').fadeTo('slow', 1);
          } else {
            Router.go('home');
          }
        });
      } else {
        Accounts.forgotPassword({ email: value }, function () { 
          alert('Success! Please check your email for a recovery link.'); 
          Router.go('landing');
        });  
      }
    }
    else {
      template.find('.landing-form-errors').innerHTML = '<li>Please fill in the fields!</li>';
      $('.landing-form-errors').fadeTo('slow', 1);
    }
  }
});