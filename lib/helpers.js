breaklines = function (str) {
  var breakTag = '<br />';    
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, 
                            '$1' + breakTag + '$2');
  //.replace(/(\r\n|\n|\r)/gm, "<br>")
};
scrollToId = function (id){
  Deps.flush(); // ensure that dom is ready first

  var comment = $("#" + id);
  $("html,body").animate({scrollTop: comment.offset().top}, "fast");
  comment.addClass("bg-fade");
  setTimeout(function() {
    comment.removeClass("bg-fade");
  }, 2000);
};

sanitize = function (s) {
  if(Meteor.isServer){
    var s = sanitizeHtml(s, {
      allowedTags: [ 'b', 'i', 'em', 'strong' ]
    });
  }
  return s;
};
stripHTML = function (s) {
  var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';
  var tagOrComment = new RegExp(
    '<(?:'
    // Comment body.
    + '!--(?:(?:-*[^->])*--+|-?)'
    // Special "raw text" elements whose content should be elided.
    + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
    + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
    // Regular name
    + '|/?[a-z]'
    + tagBody
    + ')>',
    'gi');

  var oldHtml;
  do {
    oldHtml = s;
    s = s.replace(tagOrComment, '');
  } while (s !== oldHtml);
  return s.replace(/</g, '&lt;');
};

formatDate = function (date) { // use moment js
  var months = [ "Jan", "Feb", "Mar", "Apr", "May", "June", 
                 "July", "Aug", "Sept", "Oct", "Nov", "Dec" ];
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12; //the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;

  var month = date.getMonth();
  var day = date.getDate();
  var year = date.getFullYear();

  return hours + ':' + minutes + ampm + ' - ' + day + ' ' + months[month] + ' ' + year;
};

fadeElement = function (elem) {
  if(elem.css("opacity") > 0) {
    elem.fadeOut("slow", function() {
      elem.html("");
    });
  }
};

/**
 * Takes an array of _ids and a collection name
 * Returns a collection of associated cursors
 */
idToCollection = function (ids, collection) {
  return collection.find({ "_id": { $in: ids } });
};

formatError = function (error) {
  var e = String(error).split(' ');
  e.shift(); // remove first element (the Error: part)
  e.pop(); // remove last element (the [403] part)
  return e.join(' ');
};
