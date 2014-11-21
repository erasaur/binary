Template.profile.helpers({
	currentTab: function () {
		return Session.get('currentTab');
	}
});

Template.profileButtons.helpers({
	canFollow: function () {
		return canFollow(Meteor.user(), this._id);
	},
	following: function () {
		return this.activity && this.activity.followers && 
			_.contains(this.activity.followers, Meteor.userId());
	}
});

Template.profileNav.helpers({
	isCurrentTab: function (tab) {
		return Session.equals('currentTab', tab) ? 'active' : '';
	}
});

Template.profileButtons.events({
	'click #js-follow': function (event, template) {
		Meteor.call('newFollower', this._id, function (error) {
			if (error.error === 'logged-out')
				alert('Please log in to follow other users. Thank you!');
		});
	},
	'click #js-unfollow': function (event, template) {
		Meteor.call('removeFollower', this._id, function (error) {
			if (error.error === 'logged-out')
				alert('Please log in to follow other users. Thank you!');
		});
	},
	'click #js-settings': function (event, template) {
		// Router.go(getSettingsRoute(this._id));
		Router.go('settings', { '_id': this._id });
	}
});

Template.profileNav.events({
	'click .js-nav-button': function (event, template) {
		Session.set('currentTab', event.currentTarget.getAttribute('data-tab'));
	}
});












