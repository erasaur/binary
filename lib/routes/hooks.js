Router.onBeforeAction(function () {
  if (!Meteor.loggingIn() && !Meteor.userId() && Session.get('resetPassword')) {
    this.redirect('/forgot');
  }
  this.next();
}, { except: ['landing', 'login', 'invite', 'forgotPassword'] });

Router.onBeforeAction(function () {
  if (Meteor.userId()) {
    this.redirect('home');
  }
  this.next();
}, { only: ['landing', 'login', 'invite'] });

Router.plugin('dataNotFound', { notFoundTemplate: 'notFound' });
