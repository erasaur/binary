CommentSchema = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  userId: {
    type: String
  },
  content: {
    type: String
  },
  createdAt: {
    type: Date
  },
  upvotes: { // scoring system ?
    type: Number,
    min: 0,
    optional: true
  },
  // upvoters: {
  //   type: [String],
  //   optional: true
  // },
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
  topicId: {
    type: String
  }
});

Comments = new Mongo.Collection('comments');
// Comments = new Mongo.Collection("comments", {
//   transform: function (document) {
//     document.initVotes = document.upvotes;
//     document.initDate = document.createdAt;

//     console.log("transformers");
//     return document;
//   }
// });
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



















