Template.comment.helpers({
  containerClass: function () {
    var result = '';
    if (this.isDeleted) result += 'deleted ';
    if (this.isCommentItem) result += 'list-item comment-item ';
    return result + this.side;
  },
  author: function () {
    return Meteor.users.findOne(this.userId);
  },
  toggleClass: function () {
    if (this.isCommentItem) return;
    return _.contains(SessionAmplify.get('showingReplies'), this._id) && 'showing';
  },
  voteClass: function () {
    var user = Meteor.user();
    if (!user) return;

    var upvoted = user.activity && user.activity.upvotedComments;
    return upvoted && _.contains(upvoted, this._id) ?
      'liked js-downvote-comment' : 'js-upvote-comment';
  },
  numReplies: function () {
    return this.replies && this.replies.length;
  },
  canFlag: function () {
    var user = Meteor.user();
    return user && !isAdmin(user) && user.flags && !_.contains(user.flags.comments, this._id);
  }
});

Template.newComment.created = function () {
  this.editingComment = new ReactiveVar(false);
};

Template.newComment.helpers({
  editing: function () {
    return Template.instance().editingComment.get();
  }
});

Template.newComment.events({
  'focus .js-comment-new': function (event, template) {
    template.editingComment.set(true);
    Tracker.afterFlush(function () {
      template.$('.editable').focus();
    });
  },
  'click .js-comment-cancel': function (event, template) {
    template.editingComment.set(false);
  },
  'click .js-comment-post': function (event, template) {
    if (!Session.get('currentTopic')) return;

    var comment = {
      content: template.$('.editable').val(),
      side: template.$('.js-comment-side')[0].checked ? 'con' : 'pro',
      replyTo: this.id
    };

    Meteor.call('newComment', Session.get('currentTopic'), comment, function (error, result) {
      if (error) {
        if (error.error === 'logged-out')
          toastr.warning(i18n.t('please_login'));
        else if (error.error === 'wait')
          toastr.warning(i18n.t('please_wait', { num: error.reason }));
        else if (error.error === 'invalid-content')
          toastr.warning(i18n.t('comment_too_short'));
        else
          toastr.warning(i18n.t('error'));
      }
      else {
        template.$('.editable').val('');
        template.editingComment.set(false);
        scrollToId(result);

        Tracker.afterFlush(function () {
          // shift all open reply boxes of same level and same side one row down
          var replyClass = '.comment-container.' + comment.side;
          // in root level, new comment box's parent is not sibling of any comments
          var currentRow = template.$('.comment-new').parent();
          if (currentRow.hasClass('comment-replies')) {
            var openReplies = currentRow.siblings(replyClass);
          } else {
            var openReplies = currentRow.next().find('.list').children(replyClass);
          }

          if (!openReplies || !openReplies.length) return;
          openReplies.each(function () {
            var $reply = $(this);
            $reply.insertAfter($reply.next());
          });
        });
      }
    });
  }
});

function adjustScroll ($elem, initOffset) {
  if (!$elem || !$elem.length) return;
  var offset = $elem.offset().top;
  $('html,body').scrollTop(offset - initOffset);
}

Template.comment.events({
  'mouseover .comment': _.debounce(function (event, template) {
    event.stopPropagation();

    var $content = $(event.currentTarget).find('.comment-content');
    if ($content[0].scrollHeight > $content.innerHeight()) {
      $content.parent().addClass('collapsible');
    }
  }, 100, true),
  'click .comment-content': function (event, template) {
    var parent = $(event.currentTarget).parent();
    if (parent.hasClass('collapsible')) {
      parent.toggleClass('collapsed');
    }
  },
  'click .js-toggle-replies': function (event, template) {
    if (this.isCommentItem) return;
    var self = this; //store the reference because context changes when rendering template
    var $elem = template.$('#' + self._id);
    var initOffset = $elem[0].getBoundingClientRect().top;

    // remove replies on equal or deeper level than commentRow
    var showing = SessionAmplify.get('showingReplies');
    var $replyTo = $elem.closest('.comment-row');
    var replyRows = $replyTo.siblings('.comment-container');
    var closingIds = [];

    if (replyRows.length) {
      replyRows.each(function (i) {
        closingIds[i] = $(this).attr('id');
        closingIds[i] = closingIds[i].slice(0, closingIds[i].indexOf('-'));
        // all ids to the right must be of nested level,
        // because we can only open 1 reply box per level
        showing = showing.slice(0, showing.indexOf(closingIds[i]));
      });

      // animate only when replyRows is in view
      var replyRect = replyRows[0].getBoundingClientRect();
      if (replyRect.top + replyRect.height > 0) {
        Meteor.setTimeout(function () {
          replyRows.velocity('slideUp', {
            duration: 500,
            progress: _.throttle(function () { adjustScroll($elem, initOffset); }, 20),
            complete: function () {
              Blaze.remove(Blaze.getView(replyRows[0]));
            }
          });
        }, 1);
      } else {
        Blaze.remove(Blaze.getView(replyRows[0]));
        adjustScroll($elem, initOffset);
      }
    }

    if (_.contains(closingIds, self._id)) {
      SessionAmplify.set('showingReplies', showing);
      return;
    }

    showing.push(self._id);
    SessionAmplify.set('showingReplies', showing);

    //update the color index
    var numColors = 4;
    var color = (showing.length - 1) % numColors;

    // add the replies
    Blaze.renderWithData(Template.replies, // template to render
                         { id: self._id, side: self.side, color: color }, // data context
                         $replyTo.parent()[0], // insert within
                         $replyTo.next()[0]); // insert before
  },
  'click .js-upvote-comment': function (event, template) {
    Meteor.call('upvoteComment', this);
  },
  'click .js-downvote-comment': function (event, template) {
    Meteor.call('cancelUpvoteComment', this);
  },
  'click .js-flag-comment': function (event, template) {
    var modal = Blaze.renderWithData(Template.flagForm, { _id: this._id, type: 'comments' }, $('body')[0]);
    $('#flag-modal').modal('show').on('hidden.bs.modal', function () {
      Blaze.remove(modal);
    });
  },
  'click .js-delete-comment': function (event, template) {
    if (confirm(i18n.t('are_you_sure', { action: i18n.t('delete_comment') }))) {
      Meteor.call('removeComment', this, function (error) {
        if (error) {
          if (error.error === 'no-permission')
            toastr.warning(i18n.t('no-permission'));
          else
            toastr.warning(i18n.t('error'));
        }
      });
    }
  }
});












