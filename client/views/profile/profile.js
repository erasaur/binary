Template.profileButtons.helpers({
	canFollow: function () {
		return Meteor.userId() && this._id != Meteor.userId();
	},
	following: function () {
		return this.activity && this.activity.followers && 
			this.activity.followers.indexOf(Meteor.userId()) > -1;
	}
});

Template.profile.helpers({
	currentTab: function () {
		return Session.get("currentTab");
	}
});

Template.profileNav.helpers({
	isCurrentTab: function (tab) {
		return Session.equals("currentTab", tab) ? "selected" : "";
	}
});

Template.profileButtons.events({
	"click #js-follow": function (event, template) {
		Meteor.call("newFollower", Meteor.userId(), this._id);
	},
	"click #js-unfollow": function (event, template) {
		Meteor.call("removeFollower", Meteor.userId(), this._id);
	},
	"click #js-settings": function (event, template) {
		Router.go(getSettingsRoute(this._id));
	}
});

Template.profileNav.events({
	"click .js-nav-button": function (event, template) {
		Session.set("currentTab", event.currentTarget.getAttribute("data-tab"));
	}
});












