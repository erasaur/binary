CommentSchema = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  content: {
    type: String
  },
  date: {
    type: Date
  },
  likes: { //scoring system ?
    type: Number,
    min: 0,
    optional: true
  },
  owner: {
    type: String
  },
  replies: {
    type: [String]
  },
  replyTo: {
    type: String,
    optional: true
  },
  side: {
    type: String
  },
  topic: {
    type: String
  }
});

Comments = new Mongo.Collection("comments");
Comments.attachSchema(CommentSchema);

// Comments.allow
// Comments.deny

Comments.before.insert(function (userId, doc) {
  if (Meteor.isServer)
    doc.content = sanitize(doc.content);
});

Comments.before.update(function (userId, doc, fieldNames, modifier, options) {
  if (Meteor.isServer && modifier.$set && modifier.$set.content) {
    modifier.$set = modifier.$set || {};
    modifier.$set.content = sanitize(modifier.$set.content);
  }
});



















