Template.topic.onCreated(function () {
  var topicId = this.data._id;

  this.autorun(function () {
    // reruns infinite scroll when we switch between single comment page and comment list page.
    // because the templates/layout are identical between the two pages, the templates won't be recreated
    // so we need to track changes on params and rerun it ourselves. ideally we only want to
    // track the commentId param (not any query or hash changes) but there are none of those for now.
    getCurrentParams();

    initInfiniteScroll.call(this, [
      Comments.find({ 'topicId': topicId, 'side': 'pro' }, { fields: { '_id': 1 } }),
      Comments.find({ 'topicId': topicId, 'side': 'con' }, { fields: { '_id': 1 } })
    ]);
  });
});

Template.topic.onRendered(function () {
  // top level comment reply boxes have to be animated separately
  var container = this.find('.list');
  container._uihooks = {
    insertElement: function (node, next) {
      var $node = $(node);
      if ($node.hasClass('comment-container')) {
        Meteor.setTimeout(function () {
          $node.insertBefore(next);
          $node.velocity('slideDown', { duration: 200 });
          Meteor.setTimeout(function () { $node.css('opacity', 1); }, 1);
        }, 1);
      } else {
        $node.insertBefore(next);
      }
    }
  };
});

Template.topic.onDestroyed(function () {
  stopInfiniteScroll.call(this);
});

Template.topicHeader.onRendered(function () {
  var description = this.find('.topic-description');
  var $description = $(description);

  if (!$description || !$description.length) return;

  if (description.scrollHeight > $description.innerHeight()) {
    $description.addClass('collapsible');
  }
});

Template.topic.events({
  'click #js-load-original': function (event, template) {
    Router.go('topic', { _id: this._id });
    SessionAmplify.set('showingReplies', []);
  }
});

Template.topic.helpers({
  showOriginal: function () {
    var params = getCurrentParams();
    return params && Comments.findOne(params.commentId, { fields: { '_id': 1 } });
  },
  comments: function () {
    var params = getCurrentParams();
    var comment = params && Comments.findOne(params.commentId);
    var res = [];

    if (comment) {
      comment.side === 'pro' ?
        res.push({ 'pros': comment, 'cons': null }) :
        res.push({ 'pros': null, 'cons': comment });
      res.push({ 'bottom': true });
      return res;
    }

    var selector = { 'replyTo': { $exists: false }, 'topicId': this._id };
    var incomingComments = getIncomingComments(selector);
    var comments = getComments(selector);
    comments = incomingComments.concat(comments);

    var pros = [], cons = [];
    _.each(comments, function (comment) {
      comment.side === 'pro' ? pros.push(comment) : cons.push(comment);
    });

    var len = Math.max(pros.length, cons.length), i = -1;
    while (++i < len) {
      res.push({ 'pros': pros[i], 'cons': cons[i] });
    }

    res.push({ 'bottom': true });
    return res;
  }
});

Template.topicButtons.helpers({
  following: function () {
    var user = Meteor.user();
    var following = user && user.activity && user.activity.followingTopics;
    return following && _.contains(following, this._id);
  }
});

Template.topicHeader.helpers({
  selected: function (side) {
    var userId = Meteor.userId();
    var side = side + 'Users';
    return userId && _.contains(this[side], userId) && 'selected';
  }
});

Template.topicNav.helpers({
  canFlag: function () {
    return canFlagTopic(Meteor.user(), this._id);
  }
});

Template.topicNav.events({
  'click #js-delete-topic': function (event, template) {
    if (confirm(i18n.t('are_you_sure', { action: i18n.t('delete_topic') }))) {
      Meteor.call('removeTopic', this, function (error) {
        if (error) {
          if (error.error === 'no-permission')
            toastr.warning(i18n.t('no_permission'));
          else
            toastr.warning(i18n.t('error'));
        }
      });
    }
  },
  'click #js-flag-topic': function (event, template) {
    var modal = Blaze.renderWithData(Template.flagForm, { _id: this._id, type: 'topics' }, $('body')[0]);
    $('#flag-modal').modal('show').on('hidden.bs.modal', function () {
      Blaze.remove(modal);
    });
  }
});

Template.topicHeader.events({
  'click .collapsible': function (event, template) {
    template.$('.topic-description').toggleClass('collapsed');
  },
  'click #js-vote-pro': function (event, template) {
    if (Meteor.userId())
      Meteor.call('vote', this, 'pro');
    else
      $('#signup-modal').modal();
  },
  'click #js-vote-con': function (event, template) {
    if (Meteor.userId())
      Meteor.call('vote', this, 'con');
    else
      $('#signup-modal').modal();
  }
});

Template.topicButtons.events({
  'click #js-follow': function (event, template) {
    Meteor.call('followTopic', this._id, function (error) {
      if (error) {
        if (error.error === 'logged-out')
          toastr.warning(i18n.t('please_login'));
        else
          toastr.warning(i18n.t('error'));
      }
    });
  },
  'click #js-unfollow': function (event, template) {
    Meteor.call('unfollowTopic', this._id, function (error) {
      if (error) {
        if (error.error === 'logged-out')
          toastr.warning(i18n.t('please_login'));
        else
          toastr.warning(i18n.t('error'));
      }
    });
  }
});

