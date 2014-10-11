
// BEGIN PAGE TABS -----------------------------------

Template.topicFollowers.helpers({
	followers: function () {
		return Meteor.users.find({ '_id': { $in: this.followers } });
	}
});

Template.topicCreator.helpers({
	creator: function () {
		return Meteor.users.findOne(this.userId);
	}
});

// END PAGE TABS -------------------------------------

// BEGIN PAGE LAYOUT ---------------------------------

Template.topic.helpers({
	currentTab: function () {
		return Session.get('currentTab');
	}
});

Template.topicButtons.helpers({
	following: function () {
		if (Meteor.user() && Meteor.user().activity && Meteor.user().activity.followingTopics)
			return Meteor.user().activity.followingTopics.indexOf(this._id) > -1;
	}
});

Template.topicHeader.events({
	'click #js-vote-pro': function(event, template) {
		Meteor.call('vote', this, 'pro');
	},
	'click #js-vote-con': function(event, template) {
		Meteor.call('vote', this, 'con');
	}
});

Template.topicNav.helpers({
	numComments: function () {
		return Comments.find({ 'topicId': this._id }).count();
	},
	isCurrentTab: function (tab) {
		return Session.equals('currentTab', tab) ? 'selected' : '';
	}
});

Template.topicNav.events({
	'click .js-nav-button': function (event, template) {
		SessionAmplify.set('showingReplies', []);
		Session.set('currentTab', event.currentTarget.getAttribute('data-tab'));
	}
});

Template.topicButtons.events({
	'click #js-follow': function(event, template) {
		Meteor.call('followTopic', this._id);
	},
	'click #js-unfollow': function(event, template) {
		Meteor.call('unfollowTopic', this._id);
	}
});

// END PAGE LAYOUT -----------------------------------






