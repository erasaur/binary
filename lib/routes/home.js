HomeController = RouteController.extend({
  subscriptions: function () {
    var limit = Meteor.isClient && this.state.get('itemsLimit') || 15;
    return subs.subscribe('topicsList', limit);
  },
  onRun: function () {
    this.state.set('itemsLimit', 15);
    this.next();
  },
  action: function () {
    if (this.ready()) {
      this.render('nav', { to: 'nav' });
      this.render();
    }
  },
  data: function () {
    return Topics.find({}, { sort: { 'createdAt': -1 } });
  },
  fastRender: true
});

Router.route('/', {
  name: 'home',
  controller: HomeController
});
