/**
 * All publications for topic page
 */

// Publish a single topic
Meteor.publish("topicUsers", function(topic) { 
  return Meteor.users.find(this.userId, 
                          {fields: {"activity.liked": 1, "activity.followingTopics": 1}});
});
Meteor.publish("topicComments", function(topic) { //publish by topic. sort by likes
  return Comments.find({"topic": topic}, {sort: {"likes": -1}}); //perhaps limit? display comments currently in the session of shown replies?
});