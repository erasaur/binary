AdminController = RouteController.extend({
  subscriptions: function () {
    var limit = Meteor.isClient && this.state.get('itemsLimit') || 15;
    return Meteor.subscribe('flagsList', limit);
  },
  onBeforeAction: function () {
    var userId = Meteor.userId();
    if (!isAdminById(userId)) {
      this.redirect('home');
    }
    this.next();
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
  }
});

Router.route('/admin', {
  controller: AdminController
});
