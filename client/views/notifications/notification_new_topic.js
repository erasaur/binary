Template.notificationNewTopic.helpers({
  author: function () {
    var author = this.data.author;
    return author && author.name;
  },
  topic: function () {
    var topic = this.data.topic;
    return topic && topic.title;
  }  
});
