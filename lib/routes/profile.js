ProfileController = RouteController.extend({
  subscriptions: function () {
    var query = this.params.query;

    return [
      subs.subscribe('userProfile', this.params._id),
      Meteor.subscribe('userComments', this.params._id, query.filter_by, Session.get('itemsLimit')),
      Meteor.subscribe('userTopics', this.params._id, query.filter_by, Session.get('itemsLimit'))
    ];
  },
  onRun: function () {
    Session.set('currentTab', 'profileComments');  
    console.log('onRun for profile route');
    this.next();
  },
  action: function () {
    this.render();
    this.render('nav', { to: 'nav' });
    this.render('profileButtons', { to: 'pageButtons' });
    this.render('profileHeader', { to: 'pageHeader' });
    this.render('profileNav', { to: 'pageNav' });
  },
  data: function () {
    return Meteor.users.findOne(this.params._id);
  }  
});

Router.route('/users/:_id', {
  name: 'profile',
  controller: ProfileController,
  fastRender: true
});