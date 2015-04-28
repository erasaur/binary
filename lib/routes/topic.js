TopicController = RouteController.extend({
  template: 'topic',
  subscriptions: function () {
    this._runAt = this._runAt || new Date();
    return subs.subscribe('singleTopic', this.params._id, this._runAt);
  },
  onRun: function () {
    SessionAmplify.set('showingReplies', []);
    this.next();
  },
  action: function () {
    if (this.ready()) {
      this.render('nav', { to: 'nav' });
      this.render('topicButtons', { to: 'pageButtons' });
      this.render('topicHeader', { to: 'pageHeader' });
      this.render('topicNav', { to: 'pageNav' });
      this.render();
    }
  },
  data: function () {
    return Topics.findOne(this.params._id);
  },
  onStop: function () {
    var $replyRows = $('.comment-container');
    if ($replyRows.length) {
      Blaze.remove(Blaze.getView($replyRows[0]));
      $replyRows.remove();
    }
    SessionAmplify.set('showingReplies', []);
  },
  fastRender: true
});

Router.route('/topics/:_id/', {
  name: 'topic',
  controller: TopicController,
  subscriptions: function () {
    var topicId = this.params._id;
    var limit = Meteor.isClient && this.state.get('itemsLimit') || 15;
    return [
      Meteor.subscribe('topicComments', topicId, 'pro', limit),
      Meteor.subscribe('topicComments', topicId, 'con', limit)
    ];
  },
  onRun: function () {
    this._runAt = new Date();
    this.state.set('itemsLimit', 15);
    this.next();
  }
});

Router.route('/topics/:_id/:commentId', {
  name: 'comment',
  controller: TopicController,
  subscriptions: function () {
    return [
      Meteor.subscribe('topicComment', this.params.commentId),
      Meteor.subscribe('commentReplies', this.params.commentId)
    ];
  }
});
