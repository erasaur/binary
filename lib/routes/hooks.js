Router.onBeforeAction(function () {
  if (!Meteor.loggingIn() && !Meteor.userId()) {
    this.layout('mainLayout');

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
  if (Meteor.userId()) {
    this.redirect('home');
  } else {
    this.next();
  }
}, { only: ['landing', 'login', 'invite'] });

Router.onBeforeAction(function () {
  if (!this.data()) {
    this.layout('mainLayout');
  } else {
    this.layout('pageLayout');
  }
  this.next();
}, { only: ['topic', 'profile'] });

Router.onBeforeAction(function () {
  if (!Meteor.userId() || !isAdmin(Meteor.user())) {
    this.redirect('home');
  } else {
    this.next();
  }
}, { only: ['admin'] });

Router.plugin('dataNotFound', { notFoundTemplate: 'notFound' });