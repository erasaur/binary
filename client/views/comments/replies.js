Template.replies.helpers({
	hasReplies: function () {
		return Comments.find({$and: [{'replyTo': this.id}, {'side': 'pro'}]}).count() || 
					 Comments.find({$and: [{'replyTo': this.id}, {'side': 'con'}]}).count();
	},
	replies: function () {
		var sortOptions = {
      'top': 'initVotes',
      'newest': 'initDate'
    };
    var sortBy = sortOptions[Router.current().params.sort_by] || 'initVotes';

		var pros = Comments.find({
								'replyTo': this.id, 
								'side': 'pro'
							}, { sort: setProperty({}, sortBy, -1) }).fetch();
		var	cons = Comments.find({
								'replyTo': this.id, 
								'side': 'con'
							}, { sort: setProperty({}, sortBy, -1) }).fetch();

		/** 
		 * Combines the pro and con comments into an array of objects
		 * with the format: {'pros': proComment, 'cons': conComment}
		 *
		 * pair [array] - contains the comment object
		 */
		var comments = _.map(_.zip(pros, cons), function(pair) {
			return {'pros': pair[0], 'cons': pair[1]};
		});

		// a dummy row that solves comment rendering problem (see docs error 1)
		comments.push({'bottom': true});
		return comments;
	}
});










