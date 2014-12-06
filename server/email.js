/**
 * Adopted from TelescopeJS
 *
 * See: https://github.com/TelescopeJS/Telescope/blob/ba38e2a75b1de3e5a5e5332341a74d5f4424498c/lib/permissions.js
 */

var juice = Meteor.npmRequire('juice');
var htmlToText = Meteor.npmRequire('html-to-text');

buildEmailTemplate = function (htmlContent) {
  var emailProperties = {
    body: htmlContent
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
  var courier = notification.courier;

  return (function (n) {
    var email = {
      'newTopic': {
        'subject': n.author && n.title && n.author.name + ' created a new topic: ' + n.topic.title,
        'template': 'emailNewTopic',
        'properties': {
          'actionLink': n.topic && getTopicUrl(n.topic._id)
        }
      },
      'newComment': {
        'subject': n.topic && 'New comments were posted in: ' + n.topic.title,
        'template': 'emailNewComment',
        'properties': {
          'subCount': n.count && n.count - 1,
          'actionLink': getTopicUrl(n.topic._id, n.comment._id),
          'topicMessage': n.topic && (n.topic.userId === n.user._id ? 'in your topic: ' : 'in: ') + n.topic.title
        }
      }, 
      'newReply': {
        'subject': n.author && n.author.name + ' replied to your comment in: ' + n.topic.title,
        'template': 'emailNewReply',
        'properties': {
          'subCount': n.count && n.count - 1,
          'actionLink': getTopicUrl(n.topic._id, n.comment._id),
          'topicMessage': n.topic && (n.topic.userId === n.user._id ? 'in your topic: ' : 'in: ') + n.topic.title
        }
      },
      'newFollower': {
        'subject': n.follower && n.follower.name + ' is now following you',
        'template': 'emailNewFollower',
        'properties': {
          'subCount': n.count && n.count - 1,
          'actionLink': n.follower && (n.count ? getProfileUrl(n.user._id, 'followers') : getProfileUrl(n.follower._id))
        }
      }
    };

    console.log(email);

    var subject = email[courier]['subject'];
    var properties = _.extend(n, email[courier]['properties']);
    var template = email[courier]['template'];

    var templateHTML = Handlebars.templates[template](properties);
    var emailHTML = buildEmailTemplate(templateHTML);

    return {
      subject: subject,
      html: emailHTML
    };
  })(notification.data);
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
  
  var from = 'welcome@yamcha.com';

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
