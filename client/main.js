Session.set('currentTopic');
Session.setDefault('itemsLimit', 15);
Session.setDefault('currentTab', 'profileComments');
SessionAmplify.set('showingReplies', []);

Accounts.onResetPasswordLink(function (token, done) {
  Session.set('resetPassword', token);
  done();
});

Accounts.onEmailVerificationLink(function (token, done) {
  Accounts.verifyEmail(token, function (error) {
    if (error)
      toastr.warning(i18n.t('error'));
    else
      toastr.success(i18n.t('email_verified'));
  });
  done();
});
