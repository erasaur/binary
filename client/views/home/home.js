Template.home.helpers({
	topics: function() {
		return TopicsModel.find();
	},
	moreTopics: function () {
		return !(TopicsModel.find().count() < Session.get("topicsLimit"));
	}
});

Template.home.events({
	"submit #create-topic-form": function(event, template) {
		event.preventDefault();
		var title = template.find("#create-title").value;

		Meteor.call("newTopic", title, Meteor.userId(), Meteor.user().username, function(error, result) {
			if(error) {
				alert(formatError(error));
			} else {
				$("#create-title").val("");
			}
		});
	}
});