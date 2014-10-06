var topicCategory = "Discussed";
var topicDeps = new Deps.Dependency();

Template.profileTopics.helpers({
  topicCategory: function () {
    topicDeps.depend();
    return topicCategory;
  },
  topics: function () {
    topicDeps.depend();

    // data context (this) is the user
    if (topicCategory === "Created")
      return Topics.find({"userId": this._id});

    else if (topicCategory === "Discussed")
      return this.activity && Topics.find({"_id": {$in: this.activity.discussedTopics}}) || [];
    
    else
      return this.activity && Topics.find({"_id": {$in: this.activity.followingTopics}}) || [];
  }
});

Template.profileTopics.events({
  "click li[role='presentation']": function (event, template) {
    topicCategory = event.currentTarget.getAttribute("data-category");
    topicDeps.changed();
  }
});









