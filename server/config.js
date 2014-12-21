Meteor.startup(function () {
  BrowserPolicy.framing.disallow();
  BrowserPolicy.content.allowFontOrigin('fonts.gstatic.com');
  BrowserPolicy.content.allowOriginForAll('fonts.googleapis.com');
  BrowserPolicy.content.disallowInlineScripts();
});

var resetPassword = {
  subject: function (user) {
    return 'Recovering your password on Binary';
  },
  html: function (user, url) {
    // var token = url.substring(url.lastIndexOf('/') + 1);
    // var url = Router.routes['home'].url({}, { 'query': { 'reset_code': token } });
    var properties = {
      name: getDisplayName(user),
      actionLink: url
    };
    return buildEmailTemplate(Handlebars.templates['emailResetPassword'](properties));
  }
};
resetPassword.text = function (user, url) {
  return buildEmailText(resetPassword.html);
};

var verifyEmail = {
  subject: function (user) {
    return 'Verify your email on Binary';
  },
  html: function (user, url) {
    var properties = {
      name: getDisplayName(user),
      actionLink: url
    };
    return buildEmailTemplate(Handlebars.templates['emailVerifyEmail'](properties));
  }
};
verifyEmail.text = function (user, url) {
  return buildEmailText(verifyEmail.html);
};

Accounts.emailTemplates = {
  from: 'hello@binary.com',
  siteName: 'Binary',
  resetPassword: resetPassword,
  verifyEmail: verifyEmail
};