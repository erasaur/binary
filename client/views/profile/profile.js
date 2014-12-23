Template.profileComments.created = function () {
  initInfiniteScroll.call(this, Comments.find({
    'userId': this.data._id
  }));
};
Template.profileComments.destroyed = function () {
	stopInfiniteScroll.call(this);
};
Template.profileTopics.created = function () {
	initInfiniteScroll.call(this, Topics.find({
    'userId': this.data._id
  }));
};
Template.profileTopics.destroyed = function () {
	stopInfiniteScroll.call(this);
};

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

Template.profileButtons.events({
	'click #js-follow': function (event, template) {
		Meteor.call('newFollower', this._id, function (error) {
			if (error && error.error === 'logged-out')
				alert(i18n.t('please_login'));
		});
	},
	'click #js-unfollow': function (event, template) {
		Meteor.call('removeFollower', this._id, function (error) {
			if (error && error.error === 'logged-out')
				alert(i18n.t('please_login'));
    });
	},
	'click #js-settings': function (event, template) {
		Router.go('settings', { '_id': this._id });
	},
  'click #js-logout': function (event, template) {
    Meteor.logout(function (error) {
      Router.go('home');
    });
  }
});

Template.profileNav.events({
	'click .js-nav-button': function (event, template) {
		Session.set('currentTab', event.currentTarget.getAttribute('data-tab'));
	}
});

// page tabs -----------------------------------------

Template.profileTopics.helpers({
  topics: function () {
    // data context (this) is the user
    return Topics.find({ 'userId': this._id });
  }
});

Template.profileComments.helpers({
  comments: function () {
    var comments = Comments.find({ 'userId': this._id }).map(function (comment) {
    	comment.isCommentItem = true;
    	return comment;
    });
    return comments;
  }
});

Template.profileFollowers.helpers({
  followers: function () {
    return this.activity && Meteor.users.find({
      '_id': { $in: this.activity.followers }
    });
  }
});








