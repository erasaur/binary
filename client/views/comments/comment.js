var cIndex = 0; //color index

function removeSessionReplies (rows) { 
	var ids = []; //all the ids present in rows
	var	arr; //temporary array, stores ids in session with row ids removed

	rows.each(function() {
		if(this.id && this.id.indexOf("-") > -1) { 
			ids.push(this.id.substring(0, this.id.indexOf("-")));
		}
	});

	ids = _.uniq(ids);
	arr = SessionAmplify.get("showingReplies"); //convert to array
	// remove all the ids that are contained in the set of ids to remove
	arr = _.difference(arr, ids);

	rows.remove(); // remove rows
	SessionAmplify.set("showingReplies", arr); // update session
}

Template.comment.helpers({
	showingReplies: function () {
		return SessionAmplify.get("showingReplies").indexOf(this._id) > -1;
	},
	liked: function () {
		return Meteor.user().activity.liked && Meteor.user().activity.liked.indexOf(this._id) > -1;
	}
});

Template.newComment.events({
	"click .js-post-comment": function (event, template) {
		if(!Session.get("currentTopic")) return;

		var siblings = $(event.target).siblings();
		var input = $(siblings[0]);
		var content = input.val();
		var	side = $(siblings[1]).hasClass("btn-pro") ? "pro" : "con";
		var	replyTo = this.id;
		var	replyToUser = replyTo && Comments.findOne(replyTo).userId;

		Meteor.call("newComment", Meteor.userId(), Session.get("currentTopic"), content, side, replyTo, replyToUser, function(error, result) {
			if(error)
				alert(formatError(error));
			else
				scrollToId(result);
		});

		input.val("");
	},
	"click .js-post-side": function(event, template) {
		var t = $(event.target);
		t.toggleClass("btn-pro");
		t.toggleClass("btn-con");
	}
});

// Template.commentRow.destroyed = function () {
// 	console.log('destroyed');
// }

/**
 * Takes an arbitrary div and recursively removes
 * all reply boxes of equal or deeper nesting, and 
 * updates the session array appropriately
 *
 * commentRow [jQuery obj]
 */
function closeReplies (commentRow) {
	if (!commentRow) return;

	// get all siblings that are reply boxes
	var siblings = commentRow.siblings(".comment-container");
	// id of the top level reply being closed
	var closingReply;

	// walk through each sibling (should only be one; opening multiple
	// replies of same level isn't possible since all siblings
	// are removed) and store the comment id. then traverse children 
	// of each sibling recursively. subsequently remove the stored ids
	// from session, and finally remove siblings from dom
	if (siblings.length) {
		var ids = [];
		var siblingId;

		siblings.each(function () {
			siblingId = $(this).attr("id");
			siblingId = siblingId.substring(0, siblingId.indexOf("-"));
			ids.push(siblingId);

			if (siblings.length === 1)
				closingReply = siblingId;

			if ($(this).children(".comment-container").length)
				closeReplies($(this).children().first());
		});

		var showingReplies = SessionAmplify.get("showingReplies");
		showingReplies = _.difference(showingReplies, ids);
		SessionAmplify.set("showingReplies", showingReplies);
		siblings.remove();
	}

	return closingReply;
}

Template.comment.events({
	"click .comment-content": function (event, template) {
		$(event.target).toggleClass("collapsed");
	},
	// "click .comment-replyto": function (event, template) {
	// 	event.preventDefault();
	// 	if(this.replyTo)
	// 		scrollToId(this.replyTo);
	// },
	"click .js-toggle-replies": function (event, template) {
		var self = this; //store the reference because context changes when rendering template

		// remove replies on equal or deeper level than commentRow
		var commentRow = $(event.target).closest(".comment-row");
		var closingReply = closeReplies(commentRow);

		if (closingReply && closingReply === self._id) return;

		var arr = SessionAmplify.get("showingReplies");
		arr.push(self._id.toString());
		SessionAmplify.set("showingReplies", arr);

		//update the color index
		cIndex = (cIndex >= 4) ? 0 : cIndex + 1; 

		// add the replies
		scrollToId(self._id);
		var replyTo = $("#" + self._id).closest(".comment-row");
		Blaze.renderWithData(Template.replies, //template to render
												{id: self._id, side: self.side, color: cIndex}, //data context
												replyTo.parent().get(0), // insert within
												replyTo.next().get(0)); // insert before

	},
	"click .js-like-comment": function (event, template) {
		Meteor.call("likeComment", Meteor.userId(), this._id, this.userId);
	},
	"click .js-unlike-comment": function (event, template) {
		Meteor.call("unlikeComment", Meteor.userId(), this._id, this.userId);
	}
});












