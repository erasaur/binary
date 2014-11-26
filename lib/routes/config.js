subs = new SubsManager({
  // cache recent 50 subscriptions
  cacheLimit: 50,
  // expire any subscription after 30 minutes
  expireIn: 30
});

Router.configure({
  layoutTemplate: 'mainLayout',
  notFoundTemplate: 'notFound',
  onRun: function () {
    console.log('global onRun');
    this._scrolledOnce = false;
    this.next();
  },
  progressDelay: 100 // delay before showing IR progress
});

if (Meteor.isServer) {
  FastRender.onAllRoutes(function (url) {
    subs.subscribe('currentUser');
  });  
}