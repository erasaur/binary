TopicController = RouteController.extend({
  subscriptions: function () {
    var topicId = this.params._id;
    var sortBy = this.params.query.sort_by;
    // var runAt = this.state.get('runAt');
    this._runAt = this._runAt || new Date();
    // if (!runAt) {
    //   this.state.set('runAt', new Date());
    // }
    return [
      Meteor.subscribe('singleTopic', topicId, this._runAt),
      Meteor.subscribe('topicComments', topicId, sortBy, 'pro', Session.get('itemsLimit')),
      Meteor.subscribe('topicComments', topicId, sortBy, 'con', Session.get('itemsLimit')),
      Meteor.subscribe('commentReplies', SessionAmplify.get('showingReplies'), sortBy)
    ];
  },
  onRun: function () {
    // Session.set('currentTab', 'topicComments');
    // this._runAt = new Date();
    // this.state.set('runAt', new Date());
    this._runAt = new Date();
    Session.set('itemsLimit', 1);
    SessionAmplify.set('showingReplies', []);  
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