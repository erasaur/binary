var topicCategory = new ReactiveVar('Discussed');

Template.profileTopics.helpers({
  topicCategory: function () {
    return topicCategory.get();
  },
  topics: function () {
    // data context (this) is the user
    if (topicCategory.get() === 'Created')
      return Topics.find({ 'userId': this._id });

    else if (topicCategory.get() === 'Discussed') 
      return this.activity && Topics.find({ '_id': { 
        $in: this.activity.discussedTopics 
      } });
    
    else
      return this.activity && Topics.find({ '_id': { 
        $in: this.activity.followingTopics 
      } });
  }
});

Template.profileTopics.events({
  'click li[role="presentation"]': function (event, template) {
    topicCategory.set(event.currentTarget.getAttribute('data-category'));
  }
});









