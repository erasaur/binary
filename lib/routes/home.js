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
    if (this.ready() && Meteor.user()) {
      this.render('nav', { to: 'nav' });
      this.render();
    }
    this.next();
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