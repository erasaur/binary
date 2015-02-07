TopicController = RouteController.extend({
  template: 'topic',
  subscriptions: function () {
    this._runAt = this._runAt || new Date();
    var topicId = this.params._id;
    var limit = 15;
    var replies = [];

    if (Meteor.isClient) {
      limit = Session.get('itemsLimit');
      replies = SessionAmplify.get('showingReplies');
    }

    return [
      subs.subscribe('singleTopic', topicId, this._runAt),
      Meteor.subscribe('topicComments', topicId, 'pro', limit),
      Meteor.subscribe('topicComments', topicId, 'con', limit),
      Meteor.subscribe('commentReplies', replies)
    ];
  },
  onRun: function () {
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
  fastRender: true
});

TopicCommentController = TopicController.extend({
  subscriptions: function () {
    var topicId = this.params._id;
    var commentId = this.params.commentId;
    return [
      subs.subscribe('singleTopic', topicId, this._runAt),
      Meteor.subscribe('commentReplies', [commentId])
    ];
  }
});

Router.route('/topics/:_id', {
  name: 'topic',
  controller: TopicController
});

Router.route('/topics/:_id/:commentId', {
  name: 'topic.comment',
  controller: TopicCommentController
});
