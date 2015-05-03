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
  onRun: function () {
    this._firstRun = true;
  },
  action: function () {
    var self = this;

    if (self._firstRun) {
      self._firstRun = false;

      var query = self.params.query;
      var inviterId = query && query.inviter_id;
      var inviteCode = query && query.invite_code;

      Meteor.call('validLink', inviterId, inviteCode, function (error, result) {
        if (!result || error) {
          // self.layout('mainLayout');
          // self.render('notFound');

          // rendering notFound link directly doesn't get rid of the
          // class we added to body (which changes bg color for landing).
          // easiest is to redirect to a notFound route w/o this body class
          self.redirect('notFound');
        } else {
          self.layout('landingLayout');
          self.render();
        }
      });
    }
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
Router.route('/notFound', {
  layoutTemplate: 'mainLayout'
});
