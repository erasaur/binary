Template.profile.helpers({
	canFollow: function () {
		return this.user && Meteor.userId() && this.user._id != Meteor.userId();
	},
	following: function () {
		return this.user.activity.followers && this.user.activity.followers.indexOf(Meteor.userId()) > -1;
	},
	currentTab: function () {
		return Session.get("currentTab");
	},
	isCurrentTab: function (tab) {
		return Session.equals("currentTab", tab) ? "active" : "";
	},
	likes: function () {
		return this.user && this.user.activity.likes || 0;
	}
});

Template.profile.events({
	"click .nav-button": function (event, template) {
		Session.set("currentTab", event.target.id);
	},
	"click #follow": function (event, template) {
		Meteor.call("newFollower", Meteor.userId(), this.user._id);
	},
	"click #unfollow": function (event, template) {
		Meteor.call("removeFollower", Meteor.userId(), this.user._id);
	}
});












