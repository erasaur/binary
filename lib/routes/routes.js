Router.route('/landing', {
  layoutTemplate: ''
});
Router.route('/login');
Router.route('/forgot', { 
  name: 'forgotPassword'
});
Router.route('/invite', {
  onBeforeAction: function () {
    var self = this;
    var query = self.params.query;
    var inviterId = query && query.inviter_id;
    var inviteCode = query && query.invite_code;

    Meteor.call('validLink', inviterId, inviteCode, function (error, result) {
      if (!result || error) {
        self.render('notFound');
      } else {
        self.render();
      }
    });

    this.next();
  }
});
Router.route('/users/:_id/settings', {
  name: 'settings',
  layoutTemplate: 'mainLayout'
});