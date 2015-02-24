i18n = {
  t: function (str, options) {
    return TAPi18n.__(str, options);
  }
};

getIncomingComments = function (selector) {
  var userId = Meteor.userId();
  var controller = getCurrentController();

  if (!userId || !controller) return;

  var runAt = controller._runAt;
  selector.createdAt = { $gt: runAt };
  selector.userId = userId;

  return Comments.find(selector, { sort: { 'createdAt': -1 } }).fetch();
};
getComments = function (selector) {
  var controller = getCurrentController();
  if (!controller) return;
  if (_.has(selector, 'userId')) delete selector.userId;

  var runAt = controller._runAt;
  selector.createdAt = { $lt: runAt };
  return Comments.find(selector, { sort: { 'initScore': -1 } }).fetch();
};

getSiteUrl = function () {
  return Meteor.absoluteUrl();
};
getCurrentController = function () {
  return Router && Router.current();
};
getCurrentRoute = function () {
  var controller = getCurrentController();
  return controller.url;
};
getCurrentParams = function () {
  var controller = getCurrentController();
  return controller && controller.getParams();
};
getCurrentQuery = function () {
  var params = getCurrentParams();
  return params && params.query;
};
getCurrentHash = function () {
  var params = getCurrentParams();
  return params && params.hash;
};
getSettingsUrl = function () {
  return Router.routes['settings'].url();
};
getTopicRoute = function (topicId, commentId) {
  return Router.routes['topic'].path({
    '_id': topicId,
    'commentId': commentId
  });
};
getTopicUrl = function (topicId, commentId) {
  return Router.routes['topic'].url({
    '_id': topicId,
    'commentId': commentId
  });
};
getProfileRoute = function (userId, tab) {
  if (typeof tab !== 'undefined') {
    var query = { 'query': { 'tab': tab } };
  }
  return Router.routes['profile'].path({ '_id': userId }, query);
};
getProfileUrl = function (userId, tab) {
  if (typeof tab !== 'undefined') {
    var query = { 'query': { 'tab': tab } };
  }
  return Router.routes['profile'].url({ '_id': userId }, query);
};
getInviteUrl = function (inviterId, inviteCode) {
  return Router.routes['invite'].url({}, {
    'query': {
      'inviter_id': inviterId,
      'invite_code': inviteCode
    }
  });
};

getScore = function (options) {
  check(options, { votes: Number, createdAt: Date });

  var votes = options.votes;
  var order = Math.log(Math.max(votes, 1)) / Math.LN10;
  var age = options.createdAt / 1000 - 1134028003;

  return (order + age / 45000).toFixed(7);
};
getCommentScore = function (comment) {
  check(comment, Match.ObjectIncluding({ upvotes: Number, createdAt: Date }));
  return getScore({ votes: comment.upvotes, createdAt: comment.createdAt });
};
getTopicScore = function (topic) {
  check(topic, Match.ObjectIncluding({ pro: Number, con: Number, createdAt: Date }));
  return getScore({ votes: topic.pro + topic.con, createdAt: topic.createdAt });
};

/**
 * Takes a string in camel case format and returns
 * the string with spaces and capitalization
 */
camelToTitle = function (str) {
  return str && capitalize(str.replace(/([a-z])([A-Z])/g, '$1 $2'));
};

capitalize = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

fadeElement = function ($elem) {
  if ($elem.css('opacity') > 0) {
    $elem.velocity('fadeOut', { duration: 1000, complete: function () {
      $(this).html('');
    }});
  }
};

/**
 * Sets the property 'property' of object 'obj'
 * to value 'value'
 */
setProperty = function (obj, property, value) {
  obj = obj || {};
  obj[property] = value;
  return obj;
};

getProperty = function (obj, path) {
  var path = path.split('.');
  for (var i = 0, len = path.length; i < len; i++)
    obj = obj && obj[path[i]];
  return obj;
};

// http://stackoverflow.com/questions/7793811/convert-javascript-dot-notation-object-to-nested-object
getObject = function (o) {
  var oo = {}, t, parts, part;
  for (var k in o) {
    t = oo;
    parts = k.split('.');
    var key = parts.pop();
    while (parts.length) {
      part = parts.shift();
      t = t[part] = t[part] || {};
    }
    t[key] = o[k]
  }
  return oo;
};

scrollToId = function (id) {
  // ensure that dom is ready first
  Tracker.afterFlush(function () {
    var $comment = $('#' + id);
    if (!$comment || !$comment.length) return;

    $comment
      .velocity('scroll', { 'duration': 500, 'offset': -63 })
      .addClass('bg-fade');

    setTimeout(function() {
      $comment.removeClass('bg-fade');
    }, 2000);
  });
};

validName = function (s) {
  var s = s && stripHTML(s).trim();
  return !!s && /^([a-zA-Z]+[a-zA-Z0-9.'-\s]*){3,25}$/.test(s);
};

validInput = function (s, len) {
  var len = len || 8;
  var s = s && stripSpaces(stripHTML(s));
  return !!s && s.length >= len;
};

sanitize = function (s) {
  if (Meteor.isServer) {
    var s = sanitizeHtml(s, {
      allowedTags: [
        'p', 'a', 'b', 'i', 'strong',
        'em', 'strike', 'code', 'pre'
      ]
    });
  }
  return s;
};

stripHTML = function (s) {
  return s.replace(/<(?:.|\n)*?>/gm, '');
};

stripMarkdown = function (s) {
  var html_body = marked(s);
  return stripHTML(html_body);
};

// Strips any form of whitespace, including spaces and newlines
stripSpaces = function (s) {
  return s.replace(/\s|&nbsp;/gm, '');
};

/**
 * Takes a javascript Date object
 * If the date is over a week ago,
 * Returns the date in month/day/year format
 * Otherwise, returns 'x time ago'
 */
formatDate = function (date) {
  if (!date) return;

  var then = date.getTime();
  var now  = new Date().getTime();
  var weekInMilliseconds = 604800000;

  if (now - then > weekInMilliseconds) {
    return moment(date).format('D MMM YYYY');
  }
  return moment(date).fromNow();
};

formatError = function (error) {
  return error.reason;
};













