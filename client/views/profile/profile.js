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
	"click li": function (event, template) {
		Session.set("currentTab", event.target.id);
	},
	"click #follow": function (event, template) {
		Meteor.call("newFollower", Meteor.userId(), this.user._id);
	},
	"click #unfollow": function (event, template) {
		Meteor.call("removeFollower", Meteor.userId(), this.user._id);
	}
});

Template.profileComments.helpers({
	comments: function () {
		return this.user && Comments.find({"userId": this.user._id});
	},
	title: function () {
		return Topics.findOne(this.topicId).title;
	},
	liked: function () {
		if (this.user && this.user.activity)
			return Comments.find({"_id": {$in: this.user.activity.liked}});
		return [];
	}
});

Template.profileTopics.helpers({
	topics: function () {
		if (this.user && this.user.activity)
			return Topics.find({"_id": {$in: this.user.activity.topicsDiscussed}});
		return [];
	},
	created: function () {
		return this.user && Topics.find({"userId": this.user._id});
	}
});

Template.profileUsers.helpers({
	following: function () {
		if (this.user && this.user.activity)
			return Meteor.users.find({"_id": {$in: this.user.activity.following}});
		return [];
	},
	followers: function () {
		if (this.user && this.user.activity)
			return Meteor.users.find({"_id": {$in: this.user.activity.followers}});
		return [];
	}
});












