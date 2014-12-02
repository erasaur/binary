TopicController = RouteController.extend({
  subscriptions: function () {
    return [
      Meteor.subscribe('singleTopic', this.params._id, this._runAt),
      Meteor.subscribe('topicComments', this.params._id, this.params.query.sort_by, 'pro', Session.get('itemsLimit')),
      Meteor.subscribe('topicComments', this.params._id, this.params.query.sort_by, 'con', Session.get('itemsLimit'))
    ];
  },
  onRun: function () {
    // Session.set('currentTab', 'topicComments');
    this._runAt = new Date();
    Session.set('itemsLimit', 1);
    SessionAmplify.set('showingReplies', []);  
    console.log('onRun for topic route');
    this.next();
  },
  action: function () {
    this.render();
    this.render('nav', { to: 'nav' });
    this.render('topicButtons', { to: 'pageButtons' });
    this.render('topicHeader', { to: 'pageHeader' });
    this.render('topicNav', { to: 'pageNav' });
  },
  data: function () {
    Session.set('currentTopic', this.params._id);
    return Topics.findOne({ '_id': this.params._id, 'isDeleted': false });
  }
});

Router.route('/topics/:_id', {
  name: 'topic',
  controller: TopicController,
  // fastRender: true
});