Template.topic.rendered = function () {
  initInfiniteScroll.call(this, [
    Comments.find({ 'topicId': this.data._id, 'side': 'pro' }),
    Comments.find({ 'topicId': this.data._id, 'side': 'con' })
  ]);

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
};
Template.topic.destroyed = function () {
  stopInfiniteScroll.call(this);
};

Template.topicHeader.rendered = function () {
  var description = this.find('.topic-description');
  var $description = $(description);

  if (!$description || !$description.length) return;

  if (description.scrollHeight > $description.innerHeight()) {
    $description.addClass('collapsible');
  }
};

Template.topic.events({
  'click #js-load-original': function (event, template) {
    // reset showing single comment
    var controller = getCurrentController();
    controller && controller._hash && controller._hash.set();

    // remove all reply boxes
    var showing = SessionAmplify.get('showingReplies');
    var $replyTo = template.$('#' + showing[0]);
    if ($replyTo.length) {
      var $replyToRow = $replyTo.closest('.comment-row');
      var replyRows = $replyToRow.siblings('.comment-container');
      Blaze.remove(Blaze.getView(replyRows[0]));
    }

    // reset replies
    SessionAmplify.set('showingReplies', []);
  }
});
Template.topic.helpers({
  showOriginal: function () {
    var controller = getCurrentController();
    var hash = controller && controller._hash && controller._hash.get();
    return hash && Comments.findOne(hash);
  },
  comments: function () {
    var controller = getCurrentController();
    var hash = controller && controller._hash && controller._hash.get();
    var comment = hash && Comments.findOne(hash);
    var selector = comment ?
      { '_id': comment._id } : // show only the reply on top level
      { 'replyTo': { $exists: false }, 'topicId': this._id };

    var incomingComments = getIncomingComments(selector);
    var comments = getComments(selector);
    comments = incomingComments.concat(comments);

    var pros = [], cons = [];
    _.each(comments, function (comment) {
      comment.side === 'pro' ? pros.push(comment) : cons.push(comment);
    });

    var res = [], len = Math.max(pros.length, cons.length), i = -1;
    while (++i < len) {
      res.push({ 'pros': pros[i], 'cons': cons[i] });
    }

    res.push({ 'bottom': true });
    return res;
  }
});

Template.topicButtons.helpers({
  following: function () {
    if (Meteor.user() && Meteor.user().activity && Meteor.user().activity.followingTopics)
      return _.contains(Meteor.user().activity.followingTopics, this._id);
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
    var user = Meteor.user();
    return user && !isAdmin(user) && user.flags && !_.contains(user.flags.topics, this._id);
  }
});

Template.topicNav.events({
  'click #js-delete-topic': function (event, template) {
    if (confirm(i18n.t('are_you_sure', { action: 'delete this topic' }))) {
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
    Meteor.call('vote', this, 'pro');
  },
  'click #js-vote-con': function (event, template) {
    Meteor.call('vote', this, 'con');
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

