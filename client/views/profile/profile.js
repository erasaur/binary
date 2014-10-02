Template.profile.helpers({
	canFollow: function () {
		return Meteor.userId() && this._id != Meteor.userId();
	},
	following: function () {
		return this.activity && this.activity.followers && 
			this.activity.followers.indexOf(Meteor.userId()) > -1;
	},
	currentTab: function () {
		return Session.get("currentTab");
	},
	isCurrentTab: function (tab) {
		return Session.equals("currentTab", tab) ? "active" : "";
	}
});

Template.profile.events({
	"click .js-nav-button": function (event, template) {
		Session.set("currentTab", event.target.id);
	},
	"click #follow": function (event, template) {
		Meteor.call("newFollower", Meteor.userId(), this._id);
	},
	"click #unfollow": function (event, template) {
		Meteor.call("removeFollower", Meteor.userId(), this._id);
	}
});












