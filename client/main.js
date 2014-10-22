Session.set('currentTopic');
Session.setDefault('topicsLimit', 10);
// Session.setDefault('profileCommentsLimit', 20);
Session.setDefault('currentTab', 'profileComments');
SessionAmplify.set('showingReplies', []);

Accounts.onResetPasswordLink(function (token, done) {
  Session.set('resetPassword', token);
});