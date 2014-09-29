var commentCategory = "Created";
var commentDeps = new Deps.Dependency();

Template.profileComments.helpers({
  commentCategory: function () {
    commentDeps.depend();
    return commentCategory;
  },
  comments: function () {
    commentDeps.depend();

    // data context (this) is the user
    if (commentCategory === "Created")
      return Comments.find({"userId": this._id});
    else
      return this.activity && Comments.find({"_id": {$in: this.activity.liked}}) || [];
  }
});

Template.profileComments.events({
  "click li[role='presentation']": function (event, template) {
    commentCategory = event.target.text;
    commentDeps.changed();
  }
});