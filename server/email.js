/**
 * Adopted from TelescopeJS
 *
 * See: https://github.com/TelescopeJS/Telescope/blob/ba38e2a75b1de3e5a5e5332341a74d5f4424498c/lib/permissions.js
 */

var htmlToText = Meteor.npmRequire('html-to-text');

buildEmailTemplate = function (htmlContent) {
  var emailProperties = {
    body: htmlContent,
    signature: i18n.t('email_signature'),
    footer_message: i18n.t('email_footer_message'),
    opt_out: i18n.t('email_opt_out', { url: getSettingsUrl() }),
    copyright: i18n.t('copyright')
  };

  var emailHTML = Handlebars.templates['emailWrapper'](emailProperties);
  var inlinedHTML = juice(emailHTML);
  var doctype = '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">'

  return doctype + inlinedHTML;
};

buildEmailNotification = function (notification) {
  return (function (n, courier) {
    var email = {};

    switch (courier) {
      case 'newTopic':
        if (!n.author || !n.topic) break;

        email.message = i18n.t('notification_new_topic', {
          user: n.author.name,
          topic: n.topic.title
        });
        email.action = {
          link: getTopicUrl(n.topic._id),
          message: i18n.t('discuss')
        };

        break;
      case 'newComment.topicOwner':
      case 'newComment.topicFollower':
      case 'newComment.follower':
        if (!n.topic || !n.comment) break;
        email.action = {
          link: getCommentUrl(n.topic._id, n.comment._id),
          message: i18n.t('discuss')
        };

        var topicMessage = n.topic.userId === n.user._id ?
          i18n.t('in_topic_owning', { topic: n.topic.title }) :
          i18n.t('in_topic', { topic: n.topic.title });
        var options = {
          user: n.author.name,
          topic: topicMessage
        };

        if (!n.count) {
          email.message = i18n.t('notification_new_comment', options);
          break;
        }

        options.count = n.count - 1;
        if (courier === 'newComment.follower') {
          email.message = i18n.t('notification_new_comment_plural', options);
        } else {
          email.message = i18n.t('notification_new_comment_users_plural', options);
        }

        break;
      case 'newReply':
        if (!n.author || !n.topic) break;

        email.action = {
          link: getCommentUrl(n.topic._id, n.comment._id),
          message: i18n.t('discuss')
        };

        var topicMessage = n.topic.userId === n.user._id ?
          i18n.t('in_topic_owning', { topic: n.topic.title }) :
          i18n.t('in_topic', { topic: n.topic.title });
        var options = {
          user: n.author.name,
          topic: topicMessage
        };
        if (n.count) {
          options.count = n.count - 1;
          email.message = i18n.t('notification_new_reply_plural', options);
        } else {
          email.message = i18n.t('notification_new_reply', options);
        }

        break;
      case 'newFollower':
        if (!n.follower || !n.user) break;

        email.action = {
          link: n.count ?
            getProfileUrl(n.user._id, 'followers') : getProfileUrl(n.follower._id),
          message: i18n.t('view_profile')
        };

        if (n.count) {
          email.message = i18n.t('notification_new_follower_plural', {
            user: n.follower.name,
            count: n.count - 1
          });
        } else {
          email.message = i18n.t('notification_new_follower', { user: n.follower.name });
        }

        break;
      default:
        break;
    }

    if (!email.message || !email.action) throw new Meteor.Error('invalid-content', 'Email notification not sent: missing/invalid params!');

    // var properties = _.extend(n, email.properties);
    var templateHTML = Handlebars.templates['emailNotification'](email);
    // var templateHTML = Handlebars.templates[email.template](properties);
    var emailHTML = buildEmailTemplate(templateHTML);

    return {
      subject: email.message,
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

  var from = 'Binary <hi@binary10.co>';

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
