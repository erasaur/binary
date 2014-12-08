Session.set('currentTopic');
Session.setDefault('itemsLimit', 1);
Session.setDefault('currentTab', 'profileComments');
SessionAmplify.set('showingReplies', []);

Accounts.onResetPasswordLink(function (token, done) {
  Session.set('resetPassword', token);
  done();
});

Accounts.onEmailVerificationLink(function (token, done) {
  Accounts.verifyEmail(token, function (error) {
    if (error) 
      alert(formatError(error));
    else 
      alert('Success! Your email has been verified.');
  });
  done();
});