AdminController = RouteController.extend({
  subscriptions: function () {
    return Meteor.subscribe('flagsList', Session.get('itemsLimit'));
  },
  onBeforeAction: function () {
    if (!Meteor.userId() || !isAdmin(Meteor.user())) {
      this.redirect('home');
    }
    this.next();
  },
  onRun: function () {
    Session.set('itemsLimit', 1);
    this.next();
  },
  action: function () {
    if (this.ready()) {
      this.render();
      this.render('nav', { to: 'nav' });
    }
  }
});

Router.route('/admin', {
  controller: AdminController
});
