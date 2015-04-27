HomeController = RouteController.extend({
  subscriptions: function () {
    var limit = Meteor.isClient ? Session.get('itemsLimit') : 15;

    return subs.subscribe('topicsList', limit);
  },
  onRun: function () {
    Session.set('itemsLimit', 15);
    this.next();
  },
  action: function () {
    this.render('nav', { to: 'nav' });
    if (this.ready()) {
      this.render();
    } else {
      this.render('loading');
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
