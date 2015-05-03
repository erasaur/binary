// profile comments ----------------------------------

Template.profileComments.onCreated(function () {
  var self = this;

  self.autorun(function () {
    var params = getCurrentParams(); // see note on topic.onCreated
    initInfiniteScroll.call(self, Comments.find({ 'userId': params._id }, {
      fields: { '_id': 1 }
    }));
  });
});
Template.profileComments.onDestroyed(function () {
	stopInfiniteScroll.call(this);
});

// profile topics ------------------------------------

Template.profileTopics.onCreated(function () {
  var self = this;

  self.autorun(function () {
    var params = getCurrentParams(); // see note on topic.onCreated
    initInfiniteScroll.call(self, Topics.find({ 'userId': params._id }, {
      fields: { '_id': 1 }
    }));
  });
});
Template.profileTopics.onDestroyed(function () {
	stopInfiniteScroll.call(this);
});

// profile -------------------------------------------

Template.profile.helpers({
	currentTab: function () {
    var controller = getCurrentController();
		return controller.state.get('currentTab');
	}
});

// profile buttons -----------------------------------

Template.profileButtons.helpers({
	ownProfile: function () {
		return Meteor.userId() === this._id;
	}
});

Template.profileButtons.events({
	'click #js-settings': function (event, template) {
		Router.go('settings', { '_id': this._id });
	},
  'click #js-logout': function (event, template) {
    Meteor.logout(function (error) {
      Router.go('home');
    });
  }
});

// profile header ------------------------------------

Template.profileHeader.helpers({
  canFollow: function () {
    return canFollow(Meteor.user(), this._id);
  },
  following: function () {
    var followers = getProperty(this, 'activity.followers');
    return followers && _.contains(followers, Meteor.userId());
  }
});

Template.profileHeader.events({
  'click #js-follow': function (event, template) {
    Meteor.call('newFollower', this._id, function (error) {
      if (error && error.error === 'logged-out')
        toastr.warning(i18n.t('please_login'));
    });
  },
  'click #js-unfollow': function (event, template) {
    Meteor.call('removeFollower', this._id, function (error) {
      if (error && error.error === 'logged-out')
        toastr.warning(i18n.t('please_login'));
    });
  }
});

// profile nav ---------------------------------------

Template.profileNav.helpers({
  activeClass: function (tab) {
    var controller = getCurrentController();
    return controller.state.get('currentTab') === tab && 'active';
  }
});

Template.profileNav.events({
	'click .js-nav-button': function (event, template) {
    var controller = getCurrentController();
    controller.state.set('currentTab', event.currentTarget.getAttribute('data-tab'));
	}
});

// profile tabs --------------------------------------

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








