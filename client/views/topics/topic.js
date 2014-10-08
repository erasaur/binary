Template.topic.helpers({
	currentTab: function () {
		return Session.get('currentTab');
	}
});
Template.topicComments.helpers({
	hasComments: function () { 
		// can't do comments.count (not cursor) or comments.length (dummy row)
		return Comments.find({"topicId": this._id}).count() > 0;
	},
	comments: function () {
		var pros = Comments.find({
								"replyTo": {$nin: SessionAmplify.get("showingReplies")}, 
								"topicId": this._id, 
								"side": "pro"
							}).fetch();
		var	cons = Comments.find({
								"replyTo": {$nin: SessionAmplify.get("showingReplies")}, 
								"topicId": this._id, 
								"side": "con"
							}).fetch();

		/** 
		 * Combines the pro and con comments into an array of objects
		 * with the format: {"pros": proComment, "cons": conComment}
		 *
		 * pair - array that contains the comment object
		 */
		var comments = _.map(_.zip(pros, cons), function(pair) { 
			return {"pros": pair[0], "cons": pair[1]};
		});
		//a dummy row that solves comment rendering (see docs error 1)
		comments.push({"bottom": true});
		return comments;
	}
});
Template.topicFollowers.helpers({
	followers: function () {
		return Meteor.users.find({ '_id': { $in: this.followers } });
	}
});

Template.topicNav.helpers({
	numComments: function () {
		return Comments.find({"topicId": this._id}).count();
	},
	isCurrentTab: function (tab) {
		return Session.equals("currentTab", tab) ? "selected" : "";
	}
});

Template.topicButtons.helpers({
	following: function () {
		if (Meteor.user() && Meteor.user().activity && Meteor.user().activity.followingTopics)
			return Meteor.user().activity.followingTopics.indexOf(this._id) > -1;
	}
});

Template.topicHeader.events({
	"click #js-vote-pro": function(event, template) {
		Meteor.call('vote', Session.get("currentTopic"), 'pro');
	},
	"click #js-vote-con": function(event, template) {
		Meteor.call('vote', Session.get("currentTopic"), 'con');
	}
});

Template.topicNav.events({
	"click .js-nav-button": function (event, template) {
		Session.set("currentTab", event.currentTarget.getAttribute("data-tab"));
	}
});

Template.topicButtons.events({
	"click #js-follow": function(event, template) {
		Meteor.call("followTopic", this._id);
	},
	"click #js-unfollow": function(event, template) {
		Meteor.call("unfollowTopic", this._id);
	}
});








