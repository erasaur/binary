/**
 * Adopted from TelescopeJS
 *
 * See: https://github.com/TelescopeJS/Telescope/blob/ba38e2a75b1de3e5a5e5332341a74d5f4424498c/lib/permissions.js
 */

var juice = Meteor.npmRequire('juice');
var htmlToText = Meteor.npmRequire('html-to-text');

buildEmailTemplate = function (htmlContent) {
  var emailProperties = {
    body: htmlContent,
    settingsUrl: getSettingsUrl()
  };

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

buildEmailNotification = function (notification) {
  return (function (n, courier) {
    var email = {};
    switch (courier) {
      case 'newTopic': 
        email.subject = n.author.name + ' created a new topic: ' + n.topic.title;
        email.template = 'emailNewTopic';
        email.properties = { 'actionLink': getTopicUrl(n.topic._id) };
        break;
      case 'newComment.topicOwner':
      case 'newComment.topicFollower':
      case 'newComment.follower':
        email.subject = 'New comments were posted in: ' + n.topic.title;
        email.template = 'emailNewComment';
        email.properties = {
          'subCount': n.count && n.count - 1,
          'actionLink': n.topic && n.comment && getTopicUrl(n.topic._id, n.comment._id),
          'topicMessage': n.topic && (n.topic.userId === n.user._id ? 'in your topic: ' : 'in: ') + n.topic.title,
          'followerCourier': courier === 'newComment.follower'
        };
        break;
      case 'newReply':
        email.subject = n.author.name + ' replied to your comment in: ' + n.topic.title;
        email.template = 'emailNewReply';
        email.properties = {
          'subCount': n.count && n.count - 1,
          'actionLink': n.topic && n.comment && getTopicUrl(n.topic._id, n.comment._id),
          'topicMessage': n.topic && (n.topic.userId === n.user._id ? 'in your topic: ' : 'in: ') + n.topic.title
        };
        break;
      case 'newFollower':
        email.subject = n.follower.name + ' is now following you';
        email.template = 'emailNewFollower';
        email.properties = {
          'subCount': n.count && n.count - 1,
          'actionLink': n.follower && (n.count ? getProfileUrl(n.user._id, 'followers') : getProfileUrl(n.follower._id))
        };
        break;
      default:
        break;
    }

    if (!email.subject || !email.template) throw new Meteor.Error('invalid-content', 'Email notification not sent: missing/invalid params!');

    var properties = _.extend(n, email.properties);
    var templateHTML = Handlebars.templates[email.template](properties);
    var emailHTML = buildEmailTemplate(templateHTML);

    return {
      subject: email.subject,
      html: emailHTML
    };
  })(notification.data, notification.courier);
};

buildEmailText = function (html) {
  // Auto-generate text version if it doesn't exist. Has bugs, but should be good enough. 
  return htmlToText.fromString(html, {
    wordwrap: 130
  });
};

buildAndSendEmail = function (to, subject, template, properties) {
  var html = buildEmailTemplate(Handlebars.templates[template](properties));
  return sendEmail(to, subject, html);
};

sendEmail = function (to, subject, html, text) {

  // TODO: limit who can send emails
  // TODO: fix this error: Error: getaddrinfo ENOTFOUND
  
  var from = 'welcome@binary.com';

  if (typeof text === 'undefined'){
    var text = buildEmailText(html);
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
