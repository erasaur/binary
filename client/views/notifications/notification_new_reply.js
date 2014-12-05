Template.notificationNewReply.helpers({
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
    var topic = this.data.topic;
    if (!topic) return;
    return topic.userId === Meteor.userId() ? 
      'in your topic: ' + topic.title : 'in: ' + topic.title;
  }
});
