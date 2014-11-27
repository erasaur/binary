Template.profileComments.rendered = function () {
  initInfiniteScroll.call(this, 'comments');
};
Template.profileComments.destroyed = function () {
	stopInfiniteScroll.call(this);
};
Template.profileTopics.rendered = function () {
	initInfiniteScroll.call(this, 'topics');
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
				alert('Please log in to follow other users. Thank you!');
		});
	},
	'click #js-unfollow': function (event, template) {
		Meteor.call('removeFollower', this._id, function (error) {
			if (error && error.error === 'logged-out')
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
    console.log(comments);
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








