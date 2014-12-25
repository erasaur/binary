Meteor.startup(function () {
  BrowserPolicy.framing.disallow();
  BrowserPolicy.content.allowFontOrigin('fonts.gstatic.com');
  BrowserPolicy.content.allowOriginForAll('fonts.googleapis.com');
  BrowserPolicy.content.disallowInlineScripts();
});

var emailOptions = function (emailType) {
  emailType = 'email_' + emailType;

  this.subject = function (user) {
    return i18n.t(emailType + '_subject');
  };
  this.html = function (user, url) {
    var properties = {
      greeting: i18n.t('greeting', getDisplayName(user)),
      message: i18n.t(emailType + '_message'),
      action: {
        link: url,
        message: i18n.t(emailType + '_action')
      }
    };
    return buildEmailTemplate(Handlebars.templates['emailTemplate'](properties));
  };
  this.text = function (user, url) {
    return buildEmailText(this.html);
  };
};

Accounts.emailTemplates = {
  from: 'hello@binary.com',
  siteName: 'Binary',
  resetPassword: new emailOptions('resetPassword'),
  verifyEmail: new emailOptions('verifyEmail')
};
