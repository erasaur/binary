Router.configure({
	layoutTemplate: "main",
	yieldTemplates: {
		"nav": {to: "nav"}
	},
  notFoundTemplate: "notFound"
});

Router.onBeforeAction("dataNotFound");

Router.onBeforeAction(function () {
  if(!Meteor.loggingIn() && !Meteor.user())
    this.redirect("signup");
}, {except: ["signup", "login"]}); //forgot password page

Router.onBeforeAction(function () {
  if(Meteor.user())
    this.redirect("home");
}, {only: ["signup", "login"]});

Router.onAfterAction(function () {
  if(this.ready()) {
    var hash = window.location.hash.substring(1);

    if(hash) {
      setTimeout(function () {
        scrollToId(hash);
      }, 0);
    }  
  }
});

Deps.autorun(function () {
  Meteor.subscribe("topicsList", Session.get("topicsLimit"));  
});

Meteor.subscribe("currentUser");

Router.map(function() {
	this.route("home", { 
		path: "/",
    waitOn: function () {
      return Meteor.subscribe("topicsList", Session.get("topicsLimit"));
    }
  });
  this.route("signup", {yieldTemplates: {}}); //don't yield nav
  this.route("login", {yieldTemplates: {}}); //don't yield nav
  this.route("profile", {
    path: "/users/:_id",
    waitOn: function () {
      return Meteor.subscribe("userProfile", this.params._id);
    },
    onRun: function () {
      Session.set("currentTab", "profileComments");
    },
    data: function () {
      return Meteor.users.findOne(this.params._id);
    }
  });
  this.route("topic", { 
  	path: "/topics/:_id",
  	waitOn: function () {
  		return Meteor.subscribe("singleTopic", this.params._id);
  	},
    onRun: function () {
      Session.set("currentTopic", this.params._id);
      SessionAmplify.set("showingReplies", []);
    },
  	data: function () {
      console.log("data");
			return Topics.findOne(this.params._id);
  	}
  });
  this.route("notFound", {
    path: "*"
  })
});











