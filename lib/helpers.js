getCurrentRoute = function () {
  return Router && Router.current() && Router.current().route && Router.current().route.name;
};
getCurrentQuery = function () {
  return Router && Router.current() && Router.current().params && Router.current().params.query;
};
getTopicRoute = function (topicId) {
  return '/topics/' + topicId;
};
getProfileRoute = function (userId) {
  return '/users/' + userId;
};
getSettingsRoute = function (userId) {
  return '/users/' + userId + '/settings';
};
getSiteUrl = function () {
  return Meteor.absoluteUrl();
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

// camelToDash = function (str) {
//   return str.replace(/\W+/g, '-').replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();
// };

// camelCaseify = function(str) {
//   return dashToCamel(str.replace(' ', '-'));
// };

// dashToCamel = function (str) {
//   return str.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
// };

// trimWords = function(s, numWords) {
//   expString = s.split(/\s+/,numWords);
//   if(expString.length >= numWords)
//     return expString.join(' ')+'…';
//   return s;
// };

fadeElement = function (elem) {
  if(elem.css('opacity') > 0) {
    elem.fadeOut('slow', function () {
      elem.html('');
    });
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

// http://stackoverflow.com/questions/8750362/using-variables-with-nested-javascript-object
getProperty = function (obj, path) {
  var path = path.split('.');
  var res = obj;
  for (var i = 0; i < path.length; i++) 
    res = res[path[i]];
  return res;
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
    var comment = $('#' + id);
    $('html,body').animate({ scrollTop: comment.offset().top + 20 }, 'fast');
    comment.addClass('bg-fade');
    setTimeout(function() {
      comment.removeClass('bg-fade');
    }, 2000);  
  }); 
};

validName = function (s) {
  var s = s && stripHTML(s).trim();
  console.log(s);
  return !!s && /^([a-zA-Z]+[a-zA-Z0-9.'-\s]*){3,25}$/.test(s);
};

validInput = function (s, len) {
  var len = len || 8;
  var s = s && stripSpaces(stripHTML(s));
  return !!s && s.length >= len;
};

sanitize = function (s) {
  if(Meteor.isServer){
    var s = sanitizeHtml(s, {
      allowedTags: [ 
        'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 
        'a', 'ul', 'ol', 'li', 'b', 'i', 'strong', 
        'em', 'strike', 'code', 'hr', 'br', 'pre'
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
    return moment(date).format('MMMM Do, YYYY');
  }
  return moment(date).fromNow();
};

formatError = function (error) {
  return error.reason;
};













