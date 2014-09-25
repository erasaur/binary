Template.home.helpers({
	topics: function() {
		return TopicsModel.find();
	},
	moreTopics: function () {
		return !(TopicsModel.find().count() < Session.get("topicsLimit"));
	}
});