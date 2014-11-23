Template.notificationNewComment.helpers({
  count: function () {
    return this.data.count;
  },
  author: function () {
    var author = this.data.author;
    return author && { name: author.name, url: getProfileRoute(author._id) };
  },
  topic: function () {
    var topic = this.data.topic;
    return topic && { title: topic.title, url: getTopicRoute(topic._id) };
  },
  commentUrl: function () {
    var topic = this.data.topic;
    var comment = this.data.comment;
    return topic && comment && getTopicRoute(topic._id) + '#' + comment._id;
  }
});