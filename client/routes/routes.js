Router.configure({
	layoutTemplate: 'mainLayout',
	yieldTemplates: {
		'nav': {to: 'nav'}
	},
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound'
});

Router.onBeforeAction(function () {
  if (!Meteor.loggingIn() && !Meteor.user())
    this.redirect('signup');

}, {except: ['signup', 'login', 'invite']}); //forgot password page

Router.onBeforeAction(function () {
  if (Meteor.user())
    this.redirect('home');

}, {only: ['signup', 'login', 'invite']});

Router.onBeforeAction('loading');
Router.onBeforeAction('dataNotFound');

Router.onAfterAction(function () {
  if (this.ready()) {
    var hash = window.location.hash.substring(1);

    if (hash) {
      setTimeout(function () {
        scrollToId(hash);
      }, 0);
    }  
  }
});

var subs = new SubsManager({
  // cache recent 50 subscriptions
  cacheLimit: 50,
  // expire any subscription after 30 minutes
  expireIn: 30
});


Deps.autorun(function () {
  subs.subscribe('topicsList', Session.get('topicsLimit'));  
});

Meteor.subscribe('currentUser');

Router.map(function() {
	this.route('home', { 
    path: '/',
    waitOn: function () {
      return subs.subscribe('topicsList', Session.get('topicsLimit'));
    }		
  });
  this.route('invite', { //don't yield nav
    yieldTemplates: {}, 
    onBeforeAction: function () {
      var self = this;
      var inviterId = self.params.inviter_id;
      var inviteCode = self.params.invite_code;
      Meteor.call('validLink', inviterId, inviteCode, function (error, result) {
        if (!result || error)
          self.render('notFound');
      });
    }
  }); 
  this.route('login', { yieldTemplates: {} }); //don't yield nav
  this.route('signup', { yieldTemplates: {} }); //don't yield nav
  this.route('profile', {
    path: '/users/:_id',
    layoutTemplate: 'pageLayout',
    yieldTemplates: { 
      'nav': { to: 'nav' },
      'profileButtons': { to: 'pageButtons' },
      'profileHeader': { to: 'pageHeader' },
      'profileNav': { to: 'pageNav' } 
    },
    waitOn: function () {
      return Meteor.subscribe('userProfile', this.params._id);
    },
    onRun: function () {
      Session.set('currentTab', 'profileComments');
    },
    data: function () {
      return Meteor.users.findOne(this.params._id);
    }  
  });
  this.route('topic', { 
  	path: '/topics/:_id',
    layoutTemplate: 'pageLayout',
    yieldTemplates: { 
      'nav': { to: 'nav' },
      'topicButtons': { to: 'pageButtons' },
      'topicHeader': { to: 'pageHeader' },
      'topicNav': { to: 'pageNav' } 
    },
  	waitOn: function () {
  		return Meteor.subscribe('singleTopic', this.params._id, this.params.sort_by);
  	},
    onRun: function () {
      Session.set('currentTab', 'topicComments');
      SessionAmplify.set('showingReplies', []);
    },
  	data: function () {
      Session.set('currentTopic', this.params._id);
			return Topics.findOne(this.params._id);
  	}
  });
  this.route('settings', {
    // the _id is for show and not to be used in any queries
    path: '/users/:_id/settings'
  });
});











