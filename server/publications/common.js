/**
 * All non page-specific publications
 */

// Publish current user
Meteor.publish("currentUser", function() {
  return Meteor.users.find(this.userId, {fields: {"activity": 1, "notifications": 1}});
});

// Publish all topics (sorted by date) and top comment for each
Meteor.publish("allTopics", function(limit) {
  
  // set the topic display limit
  if (limit > TopicsModel.find().count() || !limit)
    limit = 0;

  // get the topics cursor and store the ids
  var topics = TopicsModel.find({}, {limit: limit, sort: {"date": -1}});
  var topicIds = _.pluck(topics.fetch(), "_id");

  // get the top comment id of each topic
  var commentIds = [];
  for (var i = topicIds.length - 1; i >= 0; i--) {
    var comment = CommentsModel.findOne({ "topic": topicIds[i] },
                                        { sort: {"likes": -1} });
    if (comment)
      commentIds.push(comment._id);
  }

  // find the top comments
  var topComments = CommentsModel.find({"_id": {$in: commentIds}});

  return [topics, topComments];
});