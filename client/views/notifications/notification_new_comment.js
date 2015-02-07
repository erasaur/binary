Template.notificationNewComment.helpers({
  count: function () {
    return this.data.count;
  },
  subCount: function () {
    return this.data.count - 1;
  },
  author: function () {
    var author = this.data.author;
    return author && author.name;
  },
  topicMessage: function () {
    var topic = this.data.topic;
    if (!topic) return;
    return i18n.t('in_topic', {
      topic: topic.title,
      context: topic.userId === Meteor.userId() && 'owning' || ''
    });
  },
  followerCourier: function () {
    return this.courier === 'newComment.follower';
  }
});
