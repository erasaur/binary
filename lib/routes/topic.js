TopicController = RouteController.extend({
  subscriptions: function () {
    var topicId = this.params._id;
    var sortBy = this.params.query && this.params.query.sort_by || 'top';
    this._runAt = this._runAt || new Date();
    var limit = 15;
    var replies = [];

    if (Meteor.isClient) {
      limit = Session.get('itemsLimit');
      replies = SessionAmplify.get('showingReplies');
    }

    return [
      subs.subscribe('singleTopic', topicId, this._runAt),
      Meteor.subscribe('topicComments', topicId, sortBy, 'pro', limit),
      Meteor.subscribe('topicComments', topicId, sortBy, 'con', limit),
      Meteor.subscribe('commentReplies', replies, sortBy)
    ];
  },
  onRun: function () {
    this._scrollOnce = true;
    this._runAt = new Date();
    Session.set('itemsLimit', 15);
    SessionAmplify.set('showingReplies', []);
    this.next();
  },
  action: function () {
    if (this.ready() && Meteor.user()) {
      this.render();
      this.render('nav', { to: 'nav' });
      this.render('topicButtons', { to: 'pageButtons' });
      this.render('topicHeader', { to: 'pageHeader' });
      this.render('topicNav', { to: 'pageNav' });
    }
  },
  data: function () {
    Session.set('currentTopic', this.params._id);
    return Topics.findOne(this.params._id);
  },
  onAfterAction: function () {
    if (this.ready()) {
      var hash = this.params.hash;

      if (hash && this._scrollOnce) {
        this._scrollOnce = false;
        scrollToId(hash);
      }
    }
  },
  fastRender: true
});

Router.route('/topics/:_id', {
  name: 'topic',
  controller: TopicController
});
