UI.registerHelper("currentPage", function (path) {
	return getCurrentRoute() === path;
});
UI.registerHelper("formatDate", function (date) {
	return formatDate(date);
});
UI.registerHelper("formatName", function (userId) {
  return getDisplayNameById(userId);
});

//pass in an ID from handlebars, and get a collection back
// UI.registerHelper("toCollection", function(context, options) {
// 	if(context && options)
// 		return idToCollection(context, options);
// });












