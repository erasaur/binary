//formatDate()
var months = [ "Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec" ];

//removeTags()
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

//declaring it like so (as opposed to function removeTags() or var removeTags = function()) makes it global
removeTags = function(html) {
  var oldHtml;
  do {
    oldHtml = html;
    html = html.replace(tagOrComment, '');
  } while (html !== oldHtml);
  return html.replace(/</g, '&lt;');
};

formatDate = function(date) {
	var hours = date.getHours(), 
			minutes = date.getMinutes(), 
			ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12; //the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;

  var month = date.getMonth(),
  		day = date.getDate(),
  		year = date.getFullYear();

  return hours + ':' + minutes + ampm + ' - ' + day + ' ' + months[month] + ' ' + year;
};

idToCollection = function(ids, collection) {
	var result = [];
	_.each(ids, function(id) {
		result.push(collection.findOne({"_id": id}));
	});
	return result;
};

formatError = function(error) {
  var e = String(error).split(' ');
  e.shift(); //remove first element (the Error: part)
  e.pop(); //remove last element (the [403] part)
  return e.join(' ');
};

scrollToId = function(id){
  Deps.flush(); //immediately render the dom, so we can access $("#" + id)

  var comment = $("#" + id);
  $("html,body").animate({ scrollTop: comment.offset().top - 120}, "fast");
  comment.addClass("bg-fade");
  setTimeout(function() {
    comment.removeClass("bg-fade");
  }, 2000);

  //check for the case where the bottom border would be collapsed, when it shouldn't be
  var nextBorder = comment.closest("tr").next().next(); //.next() is the replies bottom, .next().next() is the border
  if(nextBorder.hasClass("collapse")) {
    nextBorder.removeClass("collapse");
  }
};













