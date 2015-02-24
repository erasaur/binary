ProfileController = RouteController.extend({
  subscriptions: function () {
    var limit = Meteor.isClient ? Session.get('itemsLimit') : 15;

    return [
      subs.subscribe('userProfile', this.params._id),
      Meteor.subscribe('userComments', this.params._id, limit),
      Meteor.subscribe('userTopics', this.params._id, limit)
    ];
  },
  onRun: function () {
    var query = this.params.query;
    var tabs = {
      'comments': 'profileComments',
      'topics': 'profileTopics',
      'followers': 'profileFollowers',
      'following': 'profileFollowing'
    };

    Session.set('itemsLimit', 15);
    Session.set('currentTab', tabs[query.tab] || 'profileComments');
    this.next();
  },
  action: function () {
    if (this.ready()) {
      this.layout('pageLayout');
      this.render('nav', { to: 'nav' });
      this.render('profileButtons', { to: 'pageButtons' });
      this.render('profileHeader', { to: 'pageHeader' });
      this.render('profileNav', { to: 'pageNav' });
      this.render();
    }
  },
  data: function () {
    return Meteor.users.findOne(this.params._id);
  },
  fastRender: true
});

Router.route('/users/:_id', {
  name: 'profile',
  controller: ProfileController
});
