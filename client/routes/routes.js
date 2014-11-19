var subs = new SubsManager({
  // cache recent 50 subscriptions
  cacheLimit: 50,
  // expire any subscription after 30 minutes
  expireIn: 30
});

Router.configure({
  layoutTemplate: 'mainLayout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function () {
    return subs.subscribe('currentUser');
  }
});

Router.onBeforeAction(function () {
  if (!Meteor.loggingIn() && !Meteor.user()) {
    if (Session.get('resetPassword')) {
      this.redirect('/forgot');
    } else {
      this.redirect('/landing');
    }
  } else {
    this.next();
  }
}, { except: ['landing', 'login', 'invite', 'forgotPassword'] });

Router.onBeforeAction(function () {
  if (Meteor.user()) {
    this.redirect('/');
  } else {
    this.next();
  }

}, { only: ['landing', 'login', 'invite'] });

// Router.onBeforeAction(function () {

// }, { only: ['admin'] });

Router.plugin('loading', { notFoundTemplate: 'loading' });
Router.plugin('dataNotFound', { notFoundTemplate: 'notFound' });

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

Router.route('/forgot', { 
  name: 'forgotPassword'
});
Router.route('/invite', {
  onBeforeAction: function () {
    var self = this;
    var inviterId = self.params.inviter_id;
    var inviteCode = self.params.invite_code;

    Meteor.call('validLink', inviterId, inviteCode, function (error, result) {
      if (!result || error) {
        self.render('notFound');
      }
    });
  }
});
Router.route('/login');
Router.route('/landing');

Router.route('/', { 
  name: 'home',
  waitOn: function () {
    return subs.subscribe('topicsList', Session.get('topicsLimit'));
  },
  action: function () {
    if (Meteor.user()) {
      this.render('nav', { to: 'nav' });
      this.render('home');
    }
  },
  data: function () {
    return Topics.find({}, { sort: { 'createdAt': -1 } });
  }
});
Router.route('/topics/:_id', {
  name: 'topic',
  waitOn: function () {
    return [
      Meteor.subscribe('singleTopic', this.params._id),
      Meteor.subscribe('topicComments', this.params._id, this.params.sort_by)
    ];
  },
  onRun: function () {
    Session.set('currentTab', 'topicComments');
    SessionAmplify.set('showingReplies', []);  
  },
  action: function () {
    if (Meteor.user()) {
      this.layout('pageLayout');
      this.render();
      this.render('nav', { to: 'nav' });
      this.render('topicButtons', { to: 'pageButtons' });
      this.render('topicHeader', { to: 'pageHeader' });
      this.render('topicNav', { to: 'pageNav' });
    }
  },
  data: function () {
    Session.set('currentTopic', this.params._id);
    return Topics.findOne({ '_id': this.params._id, 'isDeleted': false });
  }
});
Router.route('/users/:_id', {
  name: 'profile',
  waitOn: function () {
    return Meteor.subscribe('userProfile', this.params._id);
  },
  onRun: function () {
    Session.set('currentTab', 'profileComments');  
  },
  action: function () {
    if (Meteor.user()) {
      this.layout('pageLayout');
      this.render();
      this.render('nav', { to: 'nav' });
      this.render('profileButtons', { to: 'pageButtons' });
      this.render('profileHeader', { to: 'pageHeader' });
      this.render('profileNav', { to: 'pageNav' });
    }
  },
  data: function () {
    return Meteor.users.findOne(this.params._id);
  }  
});
Router.route('/users/:_id/settings', {
  name: 'settings'
});











