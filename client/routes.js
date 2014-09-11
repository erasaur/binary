Router.configure({
	layoutTemplate: "main",
  loadingTemplate: "loading",
	yieldTemplates: {
		"nav": {to: "nav"}
	},
  notFoundTemplate: "notFound"
});

Router.onBeforeAction(function() {
  if(!(Meteor.loggingIn() || Meteor.user())) {
    this.redirect("signup");
  }
}, {except: ["signup", "login"]}); //forgot password page

Router.onBeforeAction(function() {
  if(Meteor.user()) {
    this.redirect("home");
  }
}, {only: ["signup", "login"]});

//Router.onBeforeAction("loading", {except: "home"}); //show loading template when waiting for data

Router.onAfterAction(function() {
  if(this.ready()) {
    var hash = window.location.hash.substring(1);

    if(hash) {
      setTimeout(function() {
        scrollToId(hash);
      }, 0);
    }  
  }
});

Deps.autorun(function() {
  Meteor.subscribe("allTopics", Session.get("topicsLimit"));
});

Meteor.subscribe("currentUser");
Meteor.subscribe("allUsernames");

Router.map(function() {
	this.route("home", { 
		path: "/",
    waitOn: function() {
      return Meteor.subscribe("allTopics", Session.get("topicsLimit"));
    }
  });
  this.route("signup", {yieldTemplates: {}}); //don't yield nav
  this.route("login", {yieldTemplates: {}}); //don't yield nav
  this.route("profile", {
    path: "/:username",
    waitOn: function() {
      var user = this.params.username;
      return [Meteor.subscribe("profileUser", user), Meteor.subscribe("profileUsers", user), Meteor.subscribe("profileComments", user), Meteor.subscribe("profileTopics", user)];
    },
    data: function() {
      Session.set("currentTab", "followersTab");
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
  this.route("notFound", {
    path: "*"
  })
});











