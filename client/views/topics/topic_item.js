Template.topicItem.helpers({
  topComment: function () {
    return Comments.findOne({ 'topicId': this._id }, {
      sort: { 'upvotes': -1 }
    });
  }
});