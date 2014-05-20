Meteor.startup(function() {
	Session.set("currentTopic");
	Session.set("showingReplies");
	Session.setDefault("topicsLimit", 10);
	Session.setDefault("profileCommentsLimit", 20);
	Session.setDefault("currentTab", "topicsTab");
});