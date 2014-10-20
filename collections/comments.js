// schema --------------------------------------------

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
  upvoters: {
    type: [String],
    optional: true
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
  topicId: {
    type: String
  }
});

Comments = new Mongo.Collection('comments');
Comments.attachSchema(CommentSchema);

// end schema ----------------------------------------


// permissions ---------------------------------------

Comments.allow({
  update: canEditById,
  remove: function () {
    return false;
  }
});
Comments.deny(function (userId, comment, fields) {
  // if (isAdminById(userId)) return false;

  // deny update if it contains invalid fields
  return _.without(fields, 'content').length > 0;
});

// end permissions -----------------------------------


// collection hooks ----------------------------------

Comments.before.insert(function (userId, doc) {
  if (Meteor.isServer)
    doc.content = sanitize(marked(doc.content));
});

Comments.before.update(function (userId, doc, fields, modifier, options) {
  if (Meteor.isServer && modifier.$set && modifier.$set.content) {
    modifier.$set = modifier.$set || {};
    modifier.$set.content = sanitize(marked(modifier.$set.content));
  }
});

// end collection hooks ------------------------------


// methods -------------------------------------------

Meteor.methods({
  newComment: function(topicId, comment) {
    var userId = this.userId;
    var content = comment.content;
    var side = comment.side;
    var replyTo = comment.replyTo;
    // var timeSinceLastComment = timeSinceLast(user, Comments);
    // var commentInterval = Math.abs(parseInt(getSetting('commentInterval',15)));

    if (!userId || !canCommentById(userId))
      throw new Meteor.Error('logged-out', 'This user must be logged in to continue.');

    // check that user waits more than 15 seconds between comments
    // if(!this.isSimulation && (timeSinceLastComment < commentInterval))
    //   throw new Meteor.Error(704, i18n.t('Please wait ')+(commentInterval-timeSinceLastComment)+i18n.t(' seconds before commenting again'));

    if (!validInput(content))
      throw new Meteor.Error('invalid-content', 'This content does not meet the specified requirements.');
      
    Meteor.users.update(userId, { $addToSet: { 'activity.discussedTopics': topicId } });

    var comment = {
      userId: userId,
      topicId: topicId,
      createdAt: new Date(),
      content: content,
      side: side,
      upvotes: 0,
      upvoters: [],
      replyTo: replyTo,
      replies: []
    };

    comment._id = Comments.insert(comment);

    if (!!replyTo)
      Comments.update(replyTo, { $addToSet: { 'replies': comment._id } });

    Meteor.users.update(userId, { $inc: { 'stats.commentsCount': 1 } });
    Meteor.call('newCommentNotification', comment);

    return comment._id;
  }
});

// end methods ---------------------------------------
















