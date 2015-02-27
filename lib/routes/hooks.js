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

Router.onBeforeAction(function () {
  if (!this.data()) {
    this.layout('mainLayout');
  } else {
    this.layout('pageLayout');
  }
  this.next();
}, { only: ['topic', 'profile'] });

Router.plugin('dataNotFound', { notFoundTemplate: 'notFound' });
