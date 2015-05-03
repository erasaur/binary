// schema --------------------------------------------

TopicSchema = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  userId: {
    type: String
  },
  title: {
    type: String
  },
  description: {
    type: String,
    optional: true
  },
  htmlDescription: {
    type: String,
    autoValue: afAutoMarkdown('description')
  },
  createdAt: {
    type: Date
  },
  score: {
    type: Number,
    min: 0,
    decimal: true
  },
  commentsCount: {
    type: Number
  },
  commenters: {
    type: [String]
  },
  pro: {
    type: Number,
    min: 0
  },
  proUsers: {
    type: [String]
  },
  con: {
    type: Number,
    min: 0
  },
  conUsers: {
    type: [String]
  },
  followers: {
    type: [String]
  }
});

Topics = new Mongo.Collection('topics');
Topics.attachSchema(TopicSchema);

// end schema ----------------------------------------


// search --------------------------------------------

Topics.initEasySearch('title', {
	limit: 10,
  use: 'mongo-db'
});

// end search ----------------------------------------


// permissions ---------------------------------------

Topics.allow({
  // insert: canPostById,
  update: canEditById,
  remove: isAdminById
});

Topics.deny({
  update: function (userId, topic, fields) {
    if (isAdminById(userId)) return false;

    var validFields = [
      'title',
      'description'
    ];
    // deny update if it contains invalid fields
    return _.difference(fields, validFields).length > 0;
  }
});

// end permissions -----------------------------------


// methods -------------------------------------------

Meteor.methods({
  newTopic: function (topic) {
    check(topic, {
      title: String,
      description: String
    });

    var user = Meteor.user();
    var userId = this.userId;
    var title = topic.title;
    var description = topic.description;
    var timeSinceLastTopic = user && timeSinceLast(user, Topics);
    var topicInterval = 15; // 15 seconds

    if (!user || !canPost(user))
      throw new Meteor.Error('no-permission', i18n.t('please_login'));

    if(!isAdmin(user) && !this.isSimulation && timeSinceLastTopic < topicInterval)
      throw new Meteor.Error('wait', (topicInterval - timeSinceLastTopic));

    if (!validInput(title))
      throw new Meteor.Error('invalid-content', 'This content does not meet the specified requirements.');

    // check if title already exists
    var topicWithTitle = Topics.findOne({ 'title': title });

    if (typeof topicWithTitle !== 'undefined')
      throw new Meteor.Error('duplicate-content', 'This content already exists.', topicWithTitle._id);

    var topic = {
      title: title,
      description: description,
      userId: userId,
      createdAt: new Date(),
      // category: category,
      commentsCount: 0,
      pro: 0,
      con: 0,
      commenters: [],
      proUsers: [],
      conUsers: [],
      followers: []
    };

    topic.score = getTopicScore(topic);
    topic._id = Topics.insert(topic);

    Meteor.users.update(userId, { $inc: { 'stats.topicsCount': 1 } });
    Meteor.call('newTopicNotification', topic);
    Meteor.call('followTopic', topic._id);

    return topic._id;
  },
  followTopic: function (topicId) {
    check(topicId, String);

    var userId = this.userId;
    if (!userId || !canFollowById(userId))
      throw new Meteor.Error('no-permission', i18n.t('please_login'));

    Topics.update(topicId, { $addToSet: { 'followers': userId } });
    Meteor.users.update(userId, { $addToSet: { 'activity.followingTopics': topicId } });
  },
  unfollowTopic: function (topicId) {
    check(topicId, String);

    var userId = this.userId;
    if (!userId || !canFollowById(userId))
      throw new Meteor.Error('no-permission', i18n.t('please_login'));

    Topics.update(topicId, { $pull: { 'followers': userId } });
    Meteor.users.update(userId, { $pull: { 'activity.followingTopics': topicId } });
  }
});

// end methods ---------------------------------------

