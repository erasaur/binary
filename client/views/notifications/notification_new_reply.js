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
  topicTitle: function () {
    return this.data.topic && this.data.topic.title;
  }
});
