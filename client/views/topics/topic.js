function formatField(variable, value) {
	var temp = {};
	temp[variable] = value;
	return temp;
}

Yamcha.Topics = {
	vote: function(topicId, userId, side) {
		var first, second, opposite;

		if(side == "pro") {
			first = "proUsers";
			second = "conUsers";
			opposite = "con";
		} else {
			first = "conUsers";
			second = "proUsers";
			opposite = "pro";
		}

		//assume we clicked on pro
		var t = Topics.findOne(topicId);
		if(t[second].indexOf(userId) === -1) { //didn't vote con already
			if(t[first].indexOf(userId) !== -1) { //voted pro already, so unvote
				Topics.update(topicId, {$inc: formatField(side, -1)});
				Topics.update(topicId, {$pull: formatField(first, userId)});
			} else { //didn't vote at all yet, so vote
				Topics.update(topicId, {$inc: formatField(side, 1)});
				Topics.update(topicId, {$push: formatField(first, userId)});
			}
		} else { //voted con already, so switch
			Topics.update(topicId, {$inc: formatField(opposite, -1)});
			Topics.update(topicId, {$pull: formatField(second, userId)});
			Topics.update(topicId, {$inc: formatField(side, 1)});
			Topics.update(topicId, {$push: formatField(first, userId)});
		}
	}
}

Template.topic.helpers({
	hasComments: function() {
		return this.topic && Comments.find({"topicId": this.topic._id}).count() > 0;
	},
	comments: function() {
		var pros = Comments.find({
								"replyTo": {$nin: SessionAmplify.get("showingReplies")}, 
								"topicId": this.topic._id, 
								"side": "pro"
							}).fetch();
		var	cons = Comments.find({
								"replyTo": {$nin: SessionAmplify.get("showingReplies")}, 
								"topicId": this.topic._id, 
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
	},
	following: function() {
		return Meteor.user().activity.followingTopics && Meteor.user().activity.followingTopics.indexOf(this.topic._id) > -1;
	}
});

Template.topic.events({
	"click #vote-pro": function(event, template) {
		if(Session.get("currentTopic") && Meteor.userId())
			Yamcha.Topics.vote(Session.get("currentTopic"), Meteor.userId(), "pro");
	},
	"click #vote-con": function(event, template) {
		if(Session.get("currentTopic") && Meteor.userId())
			Yamcha.Topics.vote(Session.get("currentTopic"), Meteor.userId(), "con");
	},
	"click #follow": function(event, template) {
		Meteor.call("followTopic", Meteor.userId(), this.topic._id);
	},
	"click #unfollow": function(event, template) {
		Meteor.call("unfollowTopic", Meteor.userId(), this.topic._id);
	}
});








