Router.configure({
	layoutTemplate: "main",
	yieldTemplates: {
		"nav": {to: "nav"}
	},
  notFoundTemplate: "notFound"
});

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
  Meteor.subscribe("allTopics", Session.get("topicsLimit"));  
});

Meteor.subscribe("currentUser");

Router.map(function() {
	this.route("home", { 
		path: "/",
    waitOn: function () {
      return Meteor.subscribe("allTopics", Session.get("topicsLimit"));
    }
  });
  this.route("signup", {yieldTemplates: {}}); //don't yield nav
  this.route("login", {yieldTemplates: {}}); //don't yield nav
  this.route("profile", {
    path: "/users/:_id",
    waitOn: function () {
      return Meteor.subscribe("userProfile", this.params._id);
    },
    data: function () {
      Session.set("currentTab", "followersTab");
      return {
        user: Meteor.users.findOne(this.params._id)
      }
    }
  });
  this.route("topic", { 
  	path: "/topics/:_id",
  	waitOn: function () {
  		return Meteor.subscribe("singleTopic", this.params._id);
  	},
  	data: function () {
      SessionAmplify.set("showingReplies", []);
  		Session.set("currentTopic", this.params._id);
			return {
        topic: Topics.findOne(this.params._id)
      }
  	}
  });
  this.route("notFound", {
    path: "*"
  })
});











