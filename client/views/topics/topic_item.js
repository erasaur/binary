Template.topicItem.helpers({
  topComment: function () {
    var comment = Comments.findOne({ 'topicId': this._id, 'isDeleted': false }, {
      sort: { 'upvotes': -1 }
    });
    if (!comment) { return; }
    comment.isCommentItem = true;
    return comment;
  }
});
Template.topicItem.events({
  'click .js-delete-topic': function (event, template) {
    event.preventDefault();

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
  }
});
