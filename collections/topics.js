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

Topics = new Mongo.Collection("topics");
Topics.attachSchema(TopicSchema);

Topics.initEasySearch("title", {
	"limit": 20,
	"use": "mongo-db"
});

Meteor.methods({
  vote: function (topicId, side) {
    var userId = this.userId;
    if (!topicId || !userId) return;

    var first, second, opposite;

    if(side === 'pro') {
      first = 'proUsers';
      second = 'conUsers';
      opposite = 'con';
    } else {
      first = 'conUsers';
      second = 'proUsers';
      opposite = 'pro';
    }

    //assume we clicked on pro
    var t = Topics.findOne(topicId);
    if (t[second].indexOf(userId) === -1) { //didn't vote con already
      if (t[first].indexOf(userId) !== -1) { //voted pro already, so unvote
        Topics.update(topicId, { $inc: setProperty({}, side, -1) });
        Topics.update(topicId, { $pull: setProperty({}, first, userId) });
      } else { //didn't vote at all yet, so vote
        Topics.update(topicId, { $inc: setProperty({}, side, 1) });
        Topics.update(topicId, { $push: setProperty({}, first, userId) });
      }
    } else { //voted con already, so switch
      Topics.update(topicId, { $inc: setProperty({}, opposite, -1) });
      Topics.update(topicId, { $pull: setProperty({}, second, userId) });
      Topics.update(topicId, { $inc: setProperty({}, side, 1) });
      Topics.update(topicId, { $push: setProperty({}, first, userId) });
    }
  }
});









