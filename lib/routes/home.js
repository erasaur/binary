HomeController = RouteController.extend({
  subscriptions: function () {
    return subs.subscribe('topicsList', Session.get('itemsLimit'));
  },
  onRun: function () {
    Session.set('itemsLimit', 2);
  },
  action: function () {
    if (this.ready() && Meteor.user()) {
      this.render('nav', { to: 'nav' });
      this.render();
    }
  },
  data: function () {
    return Topics.find({}, { sort: { 'createdAt': -1 } });
  }
});

Router.route('/', { 
  name: 'home',
  controller: HomeController,
  // fastRender: true
});