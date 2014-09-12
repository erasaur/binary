Template.registerHelper("currentPage", function(path) {
	return Router.current().route.name == path;
});
Template.registerHelper("breaklines", function(text) {
	text = removeTags(text);
	text = text.replace(/(\r\n|\n|\r)/gm, "<br>");
	return text;
});
Template.registerHelper("formatDate", function(date) {
	if(date) {
		return formatDate(date);
	}
});

Template.home.helpers({
	topics: function() {
		return TopicsModel.find();
	},
	moreTopics: function () {
		return !(TopicsModel.find().count() < Session.get("topicsLimit"));
	}
});

Template.nav.indexes = ["topics", "users"];
Template.navItems.helpers({
	hasNotifications: function() {
		if(Meteor.user() && Meteor.user().notifications)
			return Meteor.user().notifications.commentReply.length || Meteor.user().notifications.followingUser.length || Meteor.user().notifications.followingTopic.length;
	},
	notifications: function() {
		if(Meteor.user() && Meteor.user().notifications) {
			var result = [],
					notif = Meteor.user().notifications;

			result = notif.commentReply.concat(notif.followingUser);

			_.each(notif.followingTopic, function(obj) {
				if(obj.count) { //if the "count" attribute exists, we concatenate count to message: "55" + " users posted in topic"
					result.push({"url": obj.url, "message": obj.count + obj.message, "read": false});
				} else {
					result.push(obj); //otherwise, just add the array as is	
				}
			});

			return result;
		}
	}
});

Template.replies.helpers({
	hasReplies: function() {
		return CommentsModel.find({$and: [{"replyTo": this.id}, {"side": "pro"}]}).count() || CommentsModel.find({$and: [{"replyTo": this.id}, {"side": "con"}]}).count();
	},
	replies: function() {
		var pros = CommentsModel.find({"replyTo": this.id, "side": "pro"}).fetch(),
				cons = CommentsModel.find({"replyTo": this.id, "side": "con"}).fetch();
		return _.map(_.zip(pros, cons), function(pair) { 
			return {"pros": pair[0], "cons": pair[1]};
		});
	}
});

Template.topic.helpers({
	hasComments: function() {
		return this.topic && CommentsModel.find({"topic": this.topic._id}).count() > 0;
	},
	comments: function() {
		var pros = CommentsModel.find({"replyTo": {$nin: Session.get("showingReplies")}, "topic": this.topic._id, "side": "pro"}).fetch(),
				cons = CommentsModel.find({"replyTo": {$nin: Session.get("showingReplies")}, "topic": this.topic._id, "side": "con"}).fetch();
		return _.map(_.zip(pros, cons), function(pair) { 
			return {"pros": pair[0], "cons": pair[1]};
		});	
	},
	following: function() {
		return Meteor.user().activity.followingTopics && Meteor.user().activity.followingTopics.indexOf(this.topic._id) > -1;
	}
});

Template.comment.helpers({
	hasReplies: function() {
		return CommentsModel.findOne({"topic": this.topic}).replies.length;
	},
	showingReplies: function() {
		return Session.get("showingReplies").indexOf(this._id) > -1;
	},
	readMore: function() {
		return this.content.split("\n").length > 5 || this.content.length > 200;
	},
	liked: function() {
		return Meteor.user().activity.liked && Meteor.user().activity.liked.indexOf(this._id) > -1;
	}
});

Template.profile.helpers({
	canFollow: function() {
			return this.user && Meteor.userId() && this.user._id != Meteor.userId();
	},
	following: function() {
		return this.user.activity.followers && this.user.activity.followers.indexOf(Meteor.userId()) > -1;
	},
	currentTab: function(tab) {
		return Session.equals("currentTab", tab);
	},
	likes: function() {
		if(this.user) {
			return this.user.activity.likes || 0;
		}
	}
});

Template.profileLiked.helpers({
	likes: function() {
		if(this.user) {
			return this.user.activity.likes || 0;
		}
	},
	liked: function() {
		return idToCollection(this.user.activity.liked, CommentsModel);
	}
})

Template.profileComments.helpers({
	comments: function() {
		if(this.user) { 
			return CommentsModel.find({"owner": this.user.username});
		}
	},
	title: function() {
		return TopicsModel.findOne({"_id": this.topic}).title;
	}
});

Template.profileTopics.helpers({
	topics: function() {
		return idToCollection(this.user.activity.topics, TopicsModel);
	},
	created: function() {
		if(this.user) {
			return TopicsModel.find({"owner": this.user.username});
		}
	}
});

Template.profileFollowing.helpers({
	following: function() {
		return idToCollection(this.user.activity.following, Meteor.users);
	}
});

Template.profileFollowers.helpers({
	followers: function() {
		return idToCollection(this.user.activity.followers, Meteor.users);
	}
});

//pass in an ID from handlebars, and get a collection back
// UI.registerHelper("toCollection", function(context, options) {
// 	if(context && options)
// 		return idToCollection(context, options);
// });












