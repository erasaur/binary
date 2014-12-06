Router.onBeforeAction(function () {
  if (!Meteor.loggingIn() && !Meteor.userId()) {
    this.layout('mainLayout');

    if (Session.get('resetPassword')) {
      this.redirect('/forgot');
    } else {
      this.redirect('/landing');
    }
  }
  this.next();
}, { except: ['landing', 'login', 'invite', 'forgotPassword'] });

Router.onBeforeAction(function () {
  if (Meteor.userId()) {
    this.redirect('/');
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

// Router.onBeforeAction(function () {

// }, { only: ['admin'] });