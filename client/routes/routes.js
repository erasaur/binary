Router.configure({
	layoutTemplate: "main",
	yieldTemplates: {
		"nav": {to: "nav"}
	},
  loadingTemplate: "loading",
  notFoundTemplate: "notFound"
});

Router.onBeforeAction("dataNotFound");
Router.onBeforeAction("loading");

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
    layoutTemplate: "pageLayout",
    yieldTemplates: { 
      "nav": { to: "nav" },
      "profileButtons": { to: "pageButtons" },
      "profileHeader": { to: "pageHeader" },
      "profileNav": { to: "pageNav" } 
    },
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
    layoutTemplate: "pageLayout",
    yieldTemplates: { 
      "nav": { to: "nav" },
      "topicButtons": { to: "pageButtons" },
      "topicHeader": { to: "pageHeader" },
      "topicNav": { to: "pageNav" } 
    },
  	waitOn: function () {
  		return Meteor.subscribe("singleTopic", this.params._id);
  	},
    onRun: function () {
      SessionAmplify.set("showingReplies", []);
    },
  	data: function () {
      Session.set("currentTopic", this.params._id);
			return Topics.findOne(this.params._id);
  	}
  });
  this.route("settings", {
    path: "/users/:_id/settings",
    waitOn: function () {
      return Meteor.subscribe("userProfile", this.params._id);
    }
  });
  this.route("notFound", {
    path: "*"
  });
});











