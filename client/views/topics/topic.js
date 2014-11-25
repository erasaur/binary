
// BEGIN PAGE TABS -----------------------------------

Template.topicFollowers.helpers({
	followers: function () {
		return Meteor.users.find({ '_id': { $in: this.followers } });
	}
});

// END PAGE TABS -------------------------------------

// BEGIN PAGE LAYOUT ---------------------------------

Template.topic.rendered = function () {
	this.autorun(function () {
		console.log('items limit reset');
    Session.get('currentTab');
    Session.set('itemsLimit', 15);
  });
  this._infiniteScroll = initInfiniteScroll('comments');
};

Template.topic.destroyed = function () {
  console.log('search and destroy!');
  $(window).off('scroll');
  this._infiniteScroll && this._infiniteScroll.stop();
};

Template.topic.helpers({
	currentTab: function () {
		return Session.get('currentTab');
	}
});

Template.topicButtons.helpers({
	following: function () {
		if (Meteor.user() && Meteor.user().activity && Meteor.user().activity.followingTopics)
			return _.contains(Meteor.user().activity.followingTopics, this._id);
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

Template.topicNav.events({
	'click .js-nav-button': function (event, template) {
		// SessionAmplify.set('showingReplies', []);
		// Session.set('currentTab', event.currentTarget.getAttribute('data-tab'));
		// Session.set('itemsLimit', Session.get('itemsLimit') + 15);
	}
});

Template.topicButtons.events({
	'click #js-follow': function (event, template) {
		Meteor.call('followTopic', this._id, function (error) {
			if (error) {
				if (error.error === 'logged-out')
					alert('Please log in to follow topics. Thank you!');
				else
					alert('Sorry, something went wrong. Please try again in a moment.');
			}
		});
	},
	'click #js-unfollow': function (event, template) {
		Meteor.call('unfollowTopic', this._id, function (error) {
			if (error) {
				if (error.error === 'logged-out')
					alert('Please log in to follow topics. Thank you!');
				else
					alert('Sorry, something went wrong. Please try again in a moment.');
			}
		});
	},
	'click #js-delete-topic': function (event, template) {
		Meteor.call('removeTopic', this, function (error) {
			if (error) {
				if (error.error === 'no-permission')
					alert('Oops! We\'re sorry but we can\'t let you continue.');
				else
					alert('Sorry, something went wrong. Please try again in a moment.');
			}
		});
	}
});

// END PAGE LAYOUT -----------------------------------






