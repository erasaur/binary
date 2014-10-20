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
  createdAt: {
    type: Date
  },
  // commentsCount: {
  //   type: Number,
  //   optional: true
  // },
  // commenters: {
  //   type: [String],
  //   optional: true
  // },
  pro: {
    type: Number,
    min: 0,
    optional: true
  },
  proUsers: {
    type: [String],
    optional: true
  },
  con: {
    type: Number,
    min: 0,
    optional: true
  },
  conUsers: {
    type: [String],
    optional: true
  },
  followers: {
    type: [String],
    optional: true
  }
});

Topics = new Mongo.Collection('topics');
Topics.attachSchema(TopicSchema);

// end schema ----------------------------------------


// search --------------------------------------------

Topics.initEasySearch('title', {
	'limit': 15,
	'use': 'mongo-db'
});

// end search ----------------------------------------


// permissions ---------------------------------------

Topics.allow({
  // insert: canPostById,
  update: canEditById,
  remove: function () {
    return false; // allow for admins?
  }
});

Topics.deny({
  update: function (userId, topic, fields) {
    // if (isAdminById(userId)) return false;
    var validFields = [
      'title',
      'description'
    ];
    // deny update if it contains invalid fields
    return _.difference(fields, validFields).length > 0;
  }
});

// end permissions -----------------------------------


// collection hooks ----------------------------------

Topics.before.insert(function (userId, doc) {
  if (Meteor.isServer && doc.description)
    doc.description = sanitize(marked(doc.description));
});

Topics.before.update(function (userId, doc, fields, modifier, options) {
  // sanitize before update
  if (Meteor.isServer && modifier.$set && modifier.$set.description) {
    modifier.$set = modifier.$set || {};
    modifier.$set.description = sanitize(marked(modifier.$set.description));
  }
});

// end collection hooks ------------------------------


// methods -------------------------------------------

Meteor.methods({
  newTopic: function (topic) {
    var title = topic.title;
    var description = topic.description;
    var userId = this.userId;

    if (!userId || !canPostById(userId))
      throw new Meteor.Error('logged-out', 'This user must be logged in to continue.');

    // if(!isAdmin(Meteor.user())){
  //     // check that user waits more than X seconds between posts
  //     if(!this.isSimulation && timeSinceLastPost < postInterval)
  //       throw new Meteor.Error(604, i18n.t('Please wait ')+(postInterval-timeSinceLastPost)+i18n.t(' seconds before posting again'));

  //     // check that the user doesn't post more than Y posts per day
  //     if(!this.isSimulation && numberOfPostsInPast24Hours > maxPostsPer24Hours)
  //       throw new Meteor.Error(605, i18n.t('Sorry, you cannot submit more than ')+maxPostsPer24Hours+i18n.t(' posts per day'));
  //   }

    if (!validInput(title))
      throw new Meteor.Error('invalid-content', 'This content does not meet the specified requirements.');

    // check if title already exists
    else {
      var topicWithTitle = Topics.findOne({ 'title': title });

      if (typeof topicWithTitle !== 'undefined')
        throw new Meteor.Error('duplicate-content', 'This content already exists.', topicWithTitle._id);
    }

    var topic = {
      title: title,
      description: description,
      userId: userId,
      createdAt: new Date(),
      // author: getDisplayNameById(userId),
      // category: category,
      // baseScore: 0,
      // score: 0,
      // commentsCount: 0,
      pro: 0,
      con: 0,
      proUsers: [],
      conUsers: [],
      followers: []
    };

    topic._id = Topics.insert(topic);

    Meteor.users.update(userId, { $inc: { 'stats.topicsCount': 1 } });
    Meteor.call('newTopicNotification', topic);

    return topic._id;
  },
  followTopic: function (topicId) {
    var userId = this.userId;

    if (!userId || !canFollowById(userId))
      throw new Meteor.Error(403, 'Please login to follow topics.');

    Topics.update(topicId, { $addToSet: { 'followers': userId } });
    Meteor.users.update(userId, { $addToSet: { 'activity.followingTopics': topicId } });
  },
  unfollowTopic: function (topicId) {
    var userId = this.userId;

    if (!userId || !canFollowById(userId))
      throw new Meteor.Error(403, 'Please login to follow topics.');
    
    Topics.update(topicId, { $pull: { 'followers': userId } });
    Meteor.users.update(userId, { $pull: { 'activity.followingTopics': topicId } });
  }
});

// end methods ---------------------------------------







