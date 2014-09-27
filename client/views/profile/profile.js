Template.profile.helpers({
	canFollow: function() {
		return this.user && Meteor.userId() && this.user._id != Meteor.userId();
	},
	following: function() {
		return this.user.activity.followers && this.user.activity.followers.indexOf(Meteor.userId()) > -1;
	},
	currentTab: function(tab) {
		return Session.equals("currentTab", tab);
	},
	likes: function() {
		return this.user && this.user.activity.likes || 0;
	}
});

Template.profileLiked.helpers({
	likes: function() {
		return this.user && this.user.activity.likes || 0;
	},
	liked: function() {
		return idToCollection(this.user.activity.liked, Comments);
	}
})

Template.profileComments.helpers({
	comments: function() {
		return this.user && Comments.find({"owner": this.user.username});
	},
	title: function() {
		return Topics.findOne({"_id": this.topic}).title;
	}
});

Template.profileTopics.helpers({
	topics: function() {
		return idToCollection(this.user.activity.topics, Topics);
	},
	created: function() {
		return this.user && Topics.find({"owner": this.user.username});
	}
});

Template.profileFollowing.helpers({
	following: function() {
		return idToCollection(this.user.activity.following, Meteor.users);
	}
});

Template.profileFollowers.helpers({
	followers: function() {
		return idToCollection(this.user.activity.followers, Meteor.users);
	}
});

Template.profile.events({
	"click .navbar-tab": function(event, template) {
		Session.set("currentTab", event.target.id);
	},
	"click #follow": function(event, template) {
		Meteor.call("newFollower", Meteor.userId(), this.user._id);
	},
	"click #unfollow": function(event, template) {
		Meteor.call("removeFollower", Meteor.userId(), this.user._id);
	}
});