Template.notificationNewReply.helpers({
  count: function () {
    return this.data.count;
  },
  author: function () {
    var author = this.data.author;
    return author && { 
      'name': author.name, 
      'url': getProfileRoute(author._id) 
    };
  },
  replyToUrl: function () {
    return getTopicRoute(this.data.replyTo.topicId) + '#' + this.data.replyTo._id;
  },
  topicTitle: function () {
    return this.data.topic && this.data.topic.title;
  },
  commentUrl: function () {
    var topic = this.data.topic;
    var comment = this.data.comment;
    return topic && comment && getTopicRoute(topic._id) + '#' + comment._id;
  }
});
