Template.comment.helpers({
	showingReplies: function () {
		return SessionAmplify.get('showingReplies').indexOf(this._id) > -1;
	},
	upvoted: function () {
		if (Meteor.user() && Meteor.user().activity && Meteor.user().activity.upvotedComments)
			return Meteor.user().activity.upvotedComments.indexOf(this._id) > -1;
	},
	numReplies: function () {
		return this.replies && this.replies.length;
	}
});

Template.newComment.events({
	'click .js-post-comment': function (event, template) {
		if(!Session.get('currentTopic')) return;

		var comment = {
			content: $(template.find('div.editable')).html(),
			side: $(template.find('.js-post-side')).hasClass('btn-pro') ? 'pro': 'con',
			replyTo: this.id
		};

		Meteor.call('newComment', Session.get('currentTopic'), comment, function (error, result) {

			if (error) {
				if (error.error === 'logged-out')
					alert('Please log in to comment. Thank you!');
				else if (error.error === 'invalid-content')
					alert('Sorry, your comment has to have at least 10 characters.');	
				else
					alert('Sorry, something went wrong. Please try again!');
			}
			else
				scrollToId(result);

		});

		template.find('div.editable').innerHTML = '';
	},
	'click .js-post-side': function(event, template) {
		var t = $(event.target);
		t.toggleClass('btn-pro');
		t.toggleClass('btn-con');
	}
});

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
	var siblings = commentRow.siblings('.comment-container');
	// id of the top level reply being closed
	var closingReply;

	// walk through each sibling (should only be one; opening multiple
	// replies of same level isn't possible since all siblings
	// are removed) and store the comment id. then traverse children 
	// of each sibling recursively. subsequently remove the stored ids
	// from session, and finally remove siblings from dom
	if (siblings.length) {
		var ids = []; // the ids of replies being closed
		var siblingId; // temporary var to simplify substringing

		siblings.each(function () {
			siblingId = $(this).attr('id');
			siblingId = siblingId.substring(0, siblingId.indexOf('-'));
			ids.push(siblingId);

			if (siblings.length === 1)
				closingReply = siblingId;

			if ($(this).children('.comment-container').length)
				closeReplies($(this).children().first());
		});

		var showingReplies = SessionAmplify.get('showingReplies');
		showingReplies = _.difference(showingReplies, ids);
		SessionAmplify.set('showingReplies', showingReplies);
		Blaze.remove(Blaze.getView(siblings.get(0)));
		siblings.remove();
	}

	return closingReply;
}

Template.comment.events({
	'click .comment-content': function (event, template) {
		$(event.currentTarget).toggleClass('collapsed');
	},
	// 'click .comment-replyto': function (event, template) {
	// 	event.preventDefault();
	// 	if(this.replyTo)
	// 		scrollToId(this.replyTo);
	// },
	'click .js-toggle-replies': function (event, template) {
		var self = this; //store the reference because context changes when rendering template

		// remove replies on equal or deeper level than commentRow
		var commentRow = $(event.target).closest('.comment-row');
		var closingReply = closeReplies(commentRow);

		if (closingReply && closingReply === self._id) return;

		var arr = SessionAmplify.get('showingReplies');
		arr.push(self._id.toString());
		SessionAmplify.set('showingReplies', arr);

		//update the color index
		var numColors = 4;
		var color = (arr.length - 1) % numColors;

		// add the replies
		scrollToId(self._id);
		var replyTo = $('#' + self._id).closest('.comment-row');
		Blaze.renderWithData(Template.replies, //template to render
												{id: self._id, side: self.side, color: color}, //data context
												replyTo.parent().get(0), // insert within
												replyTo.next().get(0)); // insert before

	},
	'click .js-upvote-comment': function (event, template) {
		Meteor.call('upvoteComment', this);
	},
	'click .js-downvote-comment': function (event, template) {
		Meteor.call('cancelUpvoteComment', this);
	}
});












