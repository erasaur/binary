Template.comment.helpers({
	containerClass: function () {
		return this.isDeleted ? 'deleted' : this.isCommentItem ? 'list-item comment-item' : '';
	},
	author: function () {
		return Meteor.users.findOne(this.userId);
	},
	toggleClass: function () {
		if (this.isCommentItem) return;
		return _.contains(SessionAmplify.get('showingReplies'), this._id) && 'showing';
	},
	voteClass: function () {
		var user = Meteor.user();
		if (!user) return;

		var upvoted = user.activity && user.activity.upvotedComments;
		return upvoted && _.contains(upvoted, this._id) ? 
			'liked js-downvote-comment' : 'js-upvote-comment';
	},
	numReplies: function () {
		return this.replies && this.replies.length;
	}
});

Template.newComment.created = function () {
	this.editingComment = new ReactiveVar(false);
};

Template.newComment.helpers({
	editing: function () {
		return Template.instance().editingComment.get();
	}
});

Template.newComment.events({
	'focus .js-comment-new': function (event, template) {
		template.editingComment.set(true);
		Tracker.afterFlush(function () {
			template.$('.editable').focus();
		});
	},
	'click .js-comment-cancel': function (event, template) {
		template.editingComment.set(false);
	},
	'click .js-comment-post': function (event, template) {
		if (!Session.get('currentTopic')) return;

		var comment = {
			content: template.$('.editable').val(),
			side: template.$('.js-comment-side')[0].checked ? 'con' : 'pro',
			replyTo: this.id
		};

		Meteor.call('newComment', Session.get('currentTopic'), comment, function (error, result) {
			if (error) {
				if (error.error === 'logged-out')
					alert('Please log in to comment. Thank you!');
				else if (error.error === 'wait')
					alert('Please wait ' + error.reason + ' seconds before commenting again. Thank you!');
				else if (error.error === 'invalid-content')
					alert('Sorry, your comment has to have at least 10 characters.');	
				else
					alert('Sorry, something went wrong. Please try again in a moment.');
			}
			else {
				template.$('.editable').val('');
				template.editingComment.set(false);
				// scrollToId(result);

				// shift all open reply boxes of same level and same side one row down
				var replyClass = '.comment-container.' + comment.side;
				// in root level, new comment box's parent is not sibling of any comments
				var currentRow = template.$('.comment-new').parent();
				if (currentRow.hasClass('comment-replies')) {
					var openReplies = currentRow.siblings(replyClass);
				} else {
					var openReplies = currentRow.next().find(replyClass);
				}
				
				if (!openReplies || !openReplies.length) return;
				openReplies.each(function () {
					var reply = $(this);
					reply.insertAfter(reply.next());
				});
			}
		});
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

		siblings.velocity('slideUp', { 
			duration: 200, 
			complete: function () {
				// console.log($(this), siblings);
				$(this).remove();
			}
		});
	}

	return closingReply;
}

Template.comment.events({
	'mouseover .comment': function (event, template) {
		event.stopPropagation();
		if (this._calcCollapsible) return;

		var $content = $(event.currentTarget).find('.comment-content');
		if ($content[0].scrollHeight > $content.innerHeight()) {
			$content.parent().addClass('collapsible');
		}
		this._calcCollapsible = true;
	},
	'click .comment-content': function (event, template) {
		var parent = $(event.currentTarget).parent();
		if (parent.hasClass('collapsible')) {
			parent.toggleClass('collapsed');
		}
	},
	// 'click .comment-replyto': function (event, template) {
	// 	event.preventDefault();
	// 	if(this.replyTo)
	// 		scrollToId(this.replyTo);
	// },
	'click .js-toggle-replies': function (event, template) {
		if (this.isCommentItem) return;
		var self = this; //store the reference because context changes when rendering template
		var controller = Router.current();

		controller._runAt = new Date();

		// remove replies on equal or deeper level than commentRow
		var commentRow = $(event.target).closest('.comment-row');
		var closingReply = closeReplies(commentRow);

		var elem = template.find('#' + self._id).getBoundingClientRect();
		var offset = elem.top;

		console.log(offset);

		if (closingReply && closingReply === self._id) return;

		var arr = SessionAmplify.get('showingReplies');
		arr.push(self._id.toString());
		SessionAmplify.set('showingReplies', arr);

		//update the color index
		var numColors = 4;
		var color = (arr.length - 1) % numColors;

		// add the replies
		Tracker.afterFlush(function () {
			// scrollToId(self._id);
			var elem = document.getElementById(self._id);
			var replyTo = $(elem).closest('.comment-row');
			console.log("THIS IS WHERE WE RENDER THE DATA");
			Blaze.renderWithData(Template.replies, //template to render
													{ id: self._id, side: self.side, color: color }, //data context
													replyTo.parent().get(0), // insert within
													replyTo.next().get(0)); // insert before	
			console.log(elem.getBoundingClientRect().top);
		});
		
	},
	'click .js-upvote-comment': function (event, template) {
		Meteor.call('upvoteComment', this);
	},
	'click .js-downvote-comment': function (event, template) {
		Meteor.call('cancelUpvoteComment', this);
	},
	'click .js-delete-comment': function (event, template) {
		if (confirm('Are you sure you want to delete this comment?')) {
			Meteor.call('removeComment', this, function (error) {
				if (error) {
					if (error.error === 'no-permission')
						alert('Oops! We\'re sorry but we can\'t let you continue.');
					else
						alert('Sorry, something went wrong. Please try again in a moment.');
				}
			});	
		}
	}
});












