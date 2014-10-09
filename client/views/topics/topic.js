
// BEGIN PAGE TABS -----------------------------------

Template.topicFollowers.helpers({
	followers: function () {
		return Meteor.users.find({ '_id': { $in: this.followers } });
	}
});

Template.topic.helpers({
	currentTab: function () {
		return Session.get('currentTab');
	}
});

// END PAGE TABS -------------------------------------

// BEGIN PAGE LAYOUT ---------------------------------

Template.topicButtons.helpers({
	following: function () {
		if (Meteor.user() && Meteor.user().activity && Meteor.user().activity.followingTopics)
			return Meteor.user().activity.followingTopics.indexOf(this._id) > -1;
	}
});

Template.topicHeader.events({
	"click #js-vote-pro": function(event, template) {
		Meteor.call('vote', Session.get("currentTopic"), 'pro');
	},
	"click #js-vote-con": function(event, template) {
		Meteor.call('vote', Session.get("currentTopic"), 'con');
	}
});

Template.topicNav.helpers({
	numComments: function () {
		return Comments.find({"topicId": this._id}).count();
	},
	isCurrentTab: function (tab) {
		return Session.equals("currentTab", tab) ? "selected" : "";
	}
});

Template.topicNav.events({
	"click .js-nav-button": function (event, template) {
		Session.set("currentTab", event.currentTarget.getAttribute("data-tab"));
	}
});

Template.topicButtons.events({
	"click #js-follow": function(event, template) {
		Meteor.call("followTopic", this._id);
	},
	"click #js-unfollow": function(event, template) {
		Meteor.call("unfollowTopic", this._id);
	}
});

// END PAGE LAYOUT -----------------------------------






