Template.home.helpers({
	topics: function() {
		return Topics.find();
	},
	moreTopics: function () {
		return Topics.find().count() > Session.get('topicsLimit');
	}
});