Template.notificationNewComment.helpers({
  hasCount: function () {
    return this.data.count;
  },
  count: function () {
    return this.data.count - 1;
  },
  author: function () {
    var author = this.data.author;
    return author && author.name;
  },
  topicMessage: function () {
    return topic && topic.userId === Meteor.userId() ? 
      'in your topic: ' + topic.title : 'in: ' + topic.title;
  }
});