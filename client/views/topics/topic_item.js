Template.topicItem.helpers({
  topComment: function () {
    var comment = Comments.findOne({ 'topicId': this._id, 'isDeleted': false }, {
      sort: { 'upvotes': -1 }
    });
    if (!comment) { return; }
    comment.isTopComment = true;
    return comment;
  }
});