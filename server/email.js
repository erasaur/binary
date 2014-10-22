/**
 * Adopted from TelescopeJS
 *
 * See: https://github.com/TelescopeJS/Telescope/blob/ba38e2a75b1de3e5a5e5332341a74d5f4424498c/lib/permissions.js
 */

var juice = Meteor.npmRequire('juice');
var htmlToText = Meteor.npmRequire('html-to-text');

var siteName = 'Yamcha';

buildEmailTemplate = function (htmlContent) {
  var emailProperties = {
    body: htmlContent,
    siteName: siteName
  }

  var emailHTML = Handlebars.templates['emailWrapper'](emailProperties);

  var inlinedHTML = Async.runSync(function (done) {
    juice.juiceContent(emailHTML, {
      url: getSiteUrl(),
      removeStyleTags: false
    }, function (error, result) {
      done(null, result);
    });
  }).result;

  var doctype = '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">'
  
  return doctype + inlinedHTML;
};

buildAndSendEmail = function (to, subject, template, properties) {
  var html = buildEmailTemplate(Handlebars.templates[template](properties));
  return sendEmail(to, subject, html);
};

sendEmail = function (to, subject, html, text) {

  // TODO: limit who can send emails
  // TODO: fix this error: Error: getaddrinfo ENOTFOUND
  
  var from = 'welcome@yamcha.com';
  var siteName = siteName;

  if (typeof text === 'undefined'){
    // Auto-generate text version if it doesn't exist. Has bugs, but should be good enough. 
    var text = htmlToText.fromString(html, {
      wordwrap: 130
    });
  }

  // console.log('//////// sending email…');
  // console.log('from: ' + from);
  // console.log('to: ' + to);
  // console.log('subject: ' + subject);
  // console.log('html: ' + html);
  // console.log('text: ' + text);

  var email = {
    from: from, 
    to: to, 
    subject: subject, 
    text: text,
    html: html
  }

  Email.send(email);

  return email;
};
