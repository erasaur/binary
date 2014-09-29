// Publish list of topics (sorted by date) and top comment for each

Meteor.publish("allTopics", function(limit) {  
  // set the topic display limit
  if (limit > Topics.find().count() || !limit)
    limit = 0;

  // get the topics cursor and store the ids
  var topics = Topics.find({}, {limit: limit, sort: {"createdAt": -1}});
  var topicIds = _.pluck(topics.fetch(), "_id");

  // get the owners of each topic
  var userIds = _.pluck(topics.fetch(), "userId");
  var users = Meteor.users.find({"_id": {$in: userIds}});

  // get the top comment id of each topic
  var commentIds = [];

  for (var i = topicIds.length - 1; i >= 0; i--) {
    var comment = Comments.findOne({"topicId": topicIds[i]},
                                   {sort: {"likes": -1}});
    if (comment)
      commentIds.push(comment._id);
  }

  // find the top comments
  var topComments = Comments.find({"_id": {$in: commentIds}});

  return [topics, topComments, users];
});