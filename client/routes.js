Router.configure({
	layoutTemplate: "main",
	yieldTemplates: {
		"nav": {to: "nav"}
	},
  notFoundTemplate: "notFound"
});

// Router.before(mustBeSignedIn, {except: ["home"]});
Deps.autorun(function() {
  Meteor.subscribe("allTopics", Session.get("topicsLimit"));
  Meteor.subscribe("currentUser");
});

Router.map(function() {
	this.route("home", { 
		path: "/",
    // waitOn: function() {
    //   return Meteor.subscribe("allTopics", Session.get("topicsLimit"));
    // },
    // cache: true
		/*before: function() {
      if(!Meteor.loggingIn() && !Meteor.user()) {
      	this.redirect('signup');
      }
    }*/
  });
  this.route("profile", {
    path: "/:username",
    waitOn: function() {
      var user = this.params.username;
      return [Meteor.subscribe("profileUser", user), Meteor.subscribe("profileUsers", user), Meteor.subscribe("profileComments", user), Meteor.subscribe("profileTopics", user)];
    },
    data: function() {
      Session.set("currentTab", "topicsTab");
      return {
        user: Meteor.users.findOne({"username": this.params.username})
      }
    }
  });
  this.route("topic", { 
  	path: "/topics/:_id",
  	waitOn: function() {
  		return [Meteor.subscribe("topicComments", this.params._id), Meteor.subscribe("topicUsers", this.params._id)];
  	},
  	data: function() {
      Session.set("showingReplies", []);
  		Session.set("currentTopic", this.params._id);
			return {
        topic: TopicsModel.findOne({"_id": this.params._id})
      }
  	}
  });
});











