Template.registerHelper('currentPage', function (path) {
	return getCurrentRoute() === path;
});
Template.registerHelper('formatDate', function (date) {
	return formatDate(date);
});
Template.registerHelper('formatName', function (userId) {
  return getDisplayNameById(userId);
});
Template.registerHelper('isAdmin', function () {
  return isAdmin(Meteor.user());
});

//pass in an ID from handlebars, and get a collection back
// Template.registerHelper('toCollection', function(context, options) {
// 	if(context && options)
// 		return idToCollection(context, options);
// });












