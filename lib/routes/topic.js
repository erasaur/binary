TopicController = RouteController.extend({
  subscriptions: function () {
    this._runAt = this._runAt || new Date();
    var topicId = this.params._id;
    var commentId = this.params.hash;
    var limit = 15;
    var replies = [];

    if (Meteor.isClient) {
      limit = Session.get('itemsLimit');
      replies = SessionAmplify.get('showingReplies');
    }
    if (commentId) replies.push(commentId);

    return [
      subs.subscribe('singleTopic', topicId, this._runAt),
      Meteor.subscribe('topicComments', topicId, 'pro', limit),
      Meteor.subscribe('topicComments', topicId, 'con', limit),
      Meteor.subscribe('commentReplies', replies)
    ];
  },
  onRun: function () {
    this._hash = new ReactiveVar();
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
      this._hash = this._hash || new ReactiveVar();
      var hash = this.params.hash;

      if (hash && !$('#' + hash).length) {
        this._hash.set(hash);
      }
    }
  },
  onStop: function () {
    var $replyRows = $('.comment-container');
    console.log($replyRows);
    if ($replyRows.length) {
      Blaze.remove(Blaze.getView($replyRows[0]));
      $replyRows.remove();
    }
    SessionAmplify.set('showingReplies', []);
  },
  fastRender: true
});

Router.route('/topics/:_id', {
  name: 'topic',
  controller: TopicController
});
