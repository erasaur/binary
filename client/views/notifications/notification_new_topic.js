Template.notificationNewTopic.helpers({
  author: function () {
    var author = this.data.author;
    return author && { 
      'name': author.name, 
      'url': getProfileRoute(this.data.author._id) 
    };
  },
  topic: function () {
    var topic = this.data.topic;
    return topic && { 
      'title': topic.title, 
      'url': getTopicRoute(topic._id) 
    };
  }  
});
