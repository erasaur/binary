Router.route('/login');
Router.route('/landing');
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
    this.next();
  }
});
Router.route('/users/:_id/settings', {
  name: 'settings'
});