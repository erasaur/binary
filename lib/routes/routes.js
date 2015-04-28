LandingController = RouteController.extend({
  layoutTemplate: 'landingLayout',
  onBeforeAction: function () {
    $('body').addClass('landing');
    this.next();
  },
  action: function () {
    this.layout('landingLayout');
    this.render();
  },
  onStop: function () {
    $('body').removeClass('landing');
  }
});
Router.route('/landing', {
  layoutTemplate: '',
  controller: LandingController,
  action: function () {
    this.layout('');
    this.render();
  }
});
Router.route('/login', {
  controller: LandingController
});
Router.route('/signup', {
  controller: LandingController
});
Router.route('/forgot', {
  name: 'forgotPassword',
  controller: LandingController
});
Router.route('/invite', {
  controller: LandingController,
  action: function () {
    var self = this;
    var query = self.params.query;
    var inviterId = query && query.inviter_id;
    var inviteCode = query && query.invite_code;

    Meteor.call('validLink', inviterId, inviteCode, function (error, result) {
      if (!result || error) {
        self.layout('mainLayout');
        self.render('notFound');
      } else {
        self.layout('landingLayout');
        self.render();
      }
    });
    self.render('loading');
  }
});
Router.route('/settings', {
  name: 'settings',
  onBeforeAction: function () {
    if (!Meteor.loggingIn() && !Meteor.userId()) {
      this.redirect('home');
    }
    this.next();
  },
  action: function () {
    this.layout('mainLayout');
    this.render();
  }
});
