Template.registerHelper('formatDate', function (date) {
	return formatDate(date);
});
Template.registerHelper('formatName', function (userId) {
  return getDisplayNameById(userId);
});
Template.registerHelper('isAdmin', function () {
  return isAdmin(Meteor.user());
});









