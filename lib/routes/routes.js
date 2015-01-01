Router.route('/landing', {
  layoutTemplate: ''
});
Router.route('/login', {
  layoutTemplate: 'landingLayout'
});
Router.route('/forgot', {
  name: 'forgotPassword',
  layoutTemplate: 'landingLayout'
});
Router.route('/invite', {
  layoutTemplate: 'landingLayout',
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
  }
});
Router.route('/settings', {
  name: 'settings',
  layoutTemplate: 'mainLayout'
});
