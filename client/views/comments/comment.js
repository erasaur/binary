var cIndex = 0; //color index

function removeSessionReplies(rows) { 
	var ids = []; //all the ids present in rows
	var	arr; //temporary array, stores ids in session with row ids removed

	rows.each(function() {
		if(this.id && this.id.indexOf("-") > -1) { 
			ids.push(this.id.substring(0, this.id.indexOf("-")));
		}
	});

	ids = _.uniq(ids);
	arr = SessionAmplify.get("showingReplies").slice(); //convert to array
	// remove all the ids that are contained in the set of ids to remove
	arr = _.difference(arr, ids);

	rows.remove(); // remove rows
	SessionAmplify.set("showingReplies", arr); // update session
}

Template.comment.helpers({
	hasReplies: function () {
		return Comments.findOne({"topic": this.topic}).replies.length;
	},
	showingReplies: function () {
		return SessionAmplify.get("showingReplies").indexOf(this._id) > -1;
	},
	readMore: function () {
		return this.content.split("\n").length > 5 || this.content.length > 200;
	},
	liked: function () {
		return Meteor.user().activity.liked && Meteor.user().activity.liked.indexOf(this._id) > -1;
	}
});

Template.newComment.events({
	"click .post-comment": function(event, template) {
		if(!Session.get("currentTopic")) return;

		var siblings = $(event.target).siblings();
		var	input = $(siblings[0]);
		var comment = input.val();
		var	side = $(siblings[1]).hasClass("btn-success") ? "pro" : "con";
		var	replyTo = this.id;
		var	replyToUser = replyTo && Comments.findOne({"_id": replyTo}).owner;

		Meteor.call("newComment", Meteor.userId(), Meteor.user().username, Session.get("currentTopic"), comment, side, replyTo, replyToUser, function(error, result) {
			if(error)
				alert(formatError(error));
			else
				scrollToId(result);
		});

		input.val("");
	},
	"click .post-side": function(event, template) {
		var t = $(event.target);
		t.toggleClass("btn-success");
		t.toggleClass("btn-danger");
	}
});

// Template.commentRow.destroyed = function () {
// 	console.log('destroyed');
// }

/** 
 * removes the reply box and any nested replies.
 * finds the top of the replies box using the id in format of:
 * - "#{{id}}-replies-top"
 * and iterates through dom until finding:
 * - "#{{id}}-replies-bot"
 * 
 * removes all rows within the two with jQuery, and calls
 * Blaze.remove to stop tracking these rows
 *
 * id [string] the id of the parent reply box to remove
 */
function closeReplies (id) {
	var repliesTop = $("#" + id + "-replies-top");
	var replies = repliesTop.nextUntil("#" + id + "-replies-bot");

	// replies.last() is the element before the element in the selector
	var repliesBot = replies.last().next();
	
	// add back the top and last element
	replies = replies.add(repliesTop).add(repliesBot);

	// when rendering replies, we collapse the parent rows' bottom border
	// to avoid having two borders' worth of padding.
	// check to see if we need to uncollapse the next border now that we're
	// removing the replies.
	// var nextBorder = repliesBot.next().next(); //next() is dummy row
	// if (nextBorder.hasClass("collapse")) 
	//   nextBorder.removeClass("collapse");

	//remove the reply ids from session, so they reappear as normal comments
	removeSessionReplies(replies); 
}

Template.comment.events({
	"click .comment-content": function(event, template) {
		$(event.target).toggleClass("collapsed");
	},
	"click .comment-replyto": function(event, template) {
		event.preventDefault();
		if(this.replyTo)
			scrollToId(this.replyTo);
	},
	"click .toggle-replies": function(event, template) {
		var self = this; //store the reference because context changes when rendering template

		var	parentRow = $(event.target).closest("tr"), //gets the clicked comment's tr (ie tr before the replies)
				nextRow = parentRow.next(), //top border of next tr
				repliesRow = nextRow.next();

		var	nextClass = nextRow.attr("class"),
				repliesClass = repliesRow.attr("class"); //replies' class

		// closing replies
		if (repliesRow.length && repliesRow.hasClass(self._id + "-replies")) {
			closeReplies(self._id);
			return;
		}

		// switching replies
		if (nextRow.hasClass("border") && repliesClass && repliesClass.indexOf("replies ") > -1) {
			var tempId = nextRow.attr("id"); //get the dom id
			tempId = tempId.substring(0, tempId.indexOf("-")); //extract the id from dom id

			closeReplies(tempId);
		}
		// collapse border if the row is a border, since new replies will have own border 
		// else if (repliesRow.hasClass("border"))
		//   repliesRow.addClass("collapse");

		// add id to array of replies that are showing
		var arr = SessionAmplify.get("showingReplies").slice();
		arr.push(self._id.toString());

		// if parent does not have a class, it's not a reply comment-row
		// meaning we're opening a top level reply. in which case,
		// we have to close any other top-level replies
		if(!parentRow.attr("class")) {
			var siblings = parentRow.siblings("tr[class=''], tr:not([class])")
															.children("td")
															.children("div.comment");

			// pluck the id attribute from siblings, and return the ids that
			// are present in the array of showingReplies
			var ids = _.intersection(arr, _.pluck(siblings, "id"));
			_.each(ids, function(id) {
				closeReplies(id); //close all ids in the result set
			});
		}

		cIndex = (cIndex >= 4) ? 0 : cIndex + 1; //update the color index

		// get the bg of the tr that houses the comment for which we are toggling replies
		// or return "N" if there is no bg (top level of comments)
		var replyTo = $("#" + self._id).closest("tr").attr("class"); 
		var replyToColor = replyTo || "N"; 

		// finally add the replies
		if(!$("#" + self._id + "-replies-top").length) {
			Blaze.renderWithData(Template.replies, //template to render
													{id: self._id, side: self.side, color: cIndex, replyToColor: replyToColor}, //data context
													parentRow.parent().get(0), //the parent to render in
													parentRow.next().get(0)); //insert before this
		}

		// done adding replies, set the session
		SessionAmplify.set("showingReplies", arr);
	},
	"click .like-comment": function(event, template) {
		Meteor.call("likeComment", Meteor.userId(), this._id, this.owner);
	},
	"click .unlike-comment": function(event, template) {
		Meteor.call("unlikeComment", Meteor.userId(), this._id, this.owner);
	}
});












