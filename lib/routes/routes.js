LandingController = RouteController.extend({
  onBeforeAction: function () {
    $('body').addClass('landing');
    this.next();
  },
  onStop: function () {
    $('body').removeClass('landing');
  }
});
Router.route('/landing', {
  layoutTemplate: '',
  controller: LandingController
});
Router.route('/login', {
  layoutTemplate: 'landingLayout',
  controller: LandingController
});
Router.route('/forgot', {
  name: 'forgotPassword',
  layoutTemplate: 'landingLayout',
  controller: LandingController
});
Router.route('/invite', {
  layoutTemplate: 'landingLayout',
  controller: LandingController,
  onBeforeAction: function () {
    var self = this;
    var query = self.params.query;
    var inviterId = query && query.inviter_id;
    var inviteCode = query && query.invite_code;

    Meteor.call('validLink', inviterId, inviteCode, function (error, result) {
      if (!result || error) {
        self.layout('mainLayout');
        self.render('notFound');
      } else {
        self.render();
      }
    });
    this.next();
  },
  action: function () {
    return; // don't need to render anything here
  }
});
Router.route('/settings', {
  name: 'settings',
  layoutTemplate: 'mainLayout'
});
