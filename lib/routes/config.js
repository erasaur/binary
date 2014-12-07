subs = new SubsManager({
  // cache recent 50 subscriptions
  cacheLimit: 50,
  // expire any subscription after 30 minutes
  expireIn: 30
});

Router.configure({
  layoutTemplate: 'mainLayout',
  notFoundTemplate: 'notFound',
  // subscriptions: function () {
  //   return subs.subscribe('currentUser');
  // },
  onRun: function () {
    console.log('global onRun');
    this.next();
  },
  progressDelay: 100 // delay before showing IR progress
});

subs.subscribe('currentUser');

if (Meteor.isServer) {
  FastRender.onAllRoutes(function (url) {
    this.subscribe('currentUser');
  });  
}