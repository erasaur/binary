var commentCategory = new ReactiveVar('Created');

Template.profileComments.helpers({
  commentCategory: function () {
    return commentCategory.get();
  },
  comments: function () {
    // data context (this) is the user
    if (commentCategory.get() === 'Created')
      return Comments.find({ 'userId': this._id });
      
    return this.activity && Comments.find({ '_id': {
      $in: this.activity.upvotedComments
    } });
  }
});

Template.profileComments.events({
  'click .js-dropdown-button': function (event, template) {
    commentCategory.set(event.currentTarget.getAttribute('data-category'));
  }
});