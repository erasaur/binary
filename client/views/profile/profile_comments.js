var commentCategory = 'Created';
var commentDeps = new Deps.Dependency();

Template.profileComments.helpers({
  commentCategory: function () {
    commentDeps.depend();
    return commentCategory;
  },
  comments: function () {
    commentDeps.depend();

    // data context (this) is the user
    if (commentCategory === 'Created')
      return Comments.find({'userId': this._id});
      
    return this.activity && Comments.find({'_id': {$in: this.activity.upvotedComments}}) || [];
  }
});

Template.profileComments.events({
  'click .js-dropdown-button': function (event, template) {
    commentCategory = event.currentTarget.getAttribute('data-category');
    commentDeps.changed();
  }
});