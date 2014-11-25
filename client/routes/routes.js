var subs = new SubsManager({
  // cache recent 50 subscriptions
  cacheLimit: 50,
  // expire any subscription after 30 minutes
  expireIn: 30
});
var scrolled = false;

Router.configure({
  layoutTemplate: 'mainLayout',
  // loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  onRun: function () {
    console.log('global onRun');
    scrolled = false;
    this.next();
  },
  progressDelay: 100 // delay before showing IR progress
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
// Iron.Router.plugins.dataNotFound = function (router, options) {
//   router.onBeforeAction('dataNotFound', options)
// };
Router.plugin('dataNotFound', { notFoundTemplate: 'notFound', layoutTemplate: 'mainLayout' });

Router.onAfterAction(function () {
  if (this.ready()) {
    var hash = window.location.hash.substring(1);

    if (hash && !scrolled) {
      Meteor.defer(function () {
        scrollToId(hash);
        scrolled = true;
      });
    }  
  }
});

subs.subscribe('currentUser');

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
      } else {
        self.render();
      }
    });

    this.render('loading');
  }
});
Router.route('/login');
Router.route('/landing');

Router.route('/', { 
  name: 'home',
  subscriptions: function () {
    return subs.subscribe('topicsList', Session.get('itemsLimit'));
  },
  action: function () {
    if (this.ready() && Meteor.user()) {
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
  layoutTemplate: 'pageLayout',
  subscriptions: function () {
    return [
      Meteor.subscribe('singleTopic', this.params._id),
      Meteor.subscribe('topicComments', this.params._id, this.params.sort_by, Session.get('itemsLimit'))
    ];
  },
  onRun: function () {
    // Session.set('itemsLimit', 20);
    Session.set('currentTab', 'topicComments');
    SessionAmplify.set('showingReplies', []);  
    console.log('onRun for topic route');
    this.next();
  },
  action: function () {
    if (this.ready() && this.data() && Meteor.user()) {
      // this.lookupOption('layoutTemplate')
      // if (this._layout._template !== 'pageLayout') {
      //   this.layout('pageLayout');
      // }
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
  layoutTemplate: 'pageLayout',
  subscriptions: function () {
    return Meteor.subscribe('userProfile', this.params._id);
  },
  onRun: function () {
    Session.set('currentTab', 'profileComments');  
    console.log('onRun for profile route');
    this.next();
  },
  action: function () {
    if (this.ready() && this.data() && Meteor.user()) {
      // if (this._layout._template !== 'pageLayout') {
      //   this.layout('pageLayout');
      // }
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











