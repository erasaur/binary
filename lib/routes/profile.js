ProfileController = RouteController.extend({
  subscriptions: function () {
    return [
      subs.subscribe('userProfile', this.params._id),
      Meteor.subscribe('userComments', this.params._id, Session.get('itemsLimit')),
      Meteor.subscribe('userTopics', this.params._id, Session.get('itemsLimit'))
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
    
    Session.set('itemsLimit', 2);
    Session.set('currentTab', tabs[query.tab] || 'profileComments');  
    console.log('onRun for profile route');
    this.next();
  },
  action: function () {
    if (this.ready() && Meteor.user()) {
      this.render();
      this.render('nav', { to: 'nav' });
      this.render('profileButtons', { to: 'pageButtons' });
      this.render('profileHeader', { to: 'pageHeader' });
      this.render('profileNav', { to: 'pageNav' });
    }
    this.next();
  },
  data: function () {
    return Meteor.users.findOne(this.params._id);
  }  
});

Router.route('/users/:_id', {
  name: 'profile',
  controller: ProfileController,
  // fastRender: true
});