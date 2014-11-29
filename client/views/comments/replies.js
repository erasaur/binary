Template.replies.helpers({
	hasReplies: function () {
		return this.replies.length;
	},
	replies: function () {
		var sortOptions = {
      'top': 'initVotes',
      'newest': 'initDate'
    };
    var query = getCurrentQuery();
    var sortBy = query && sortOptions[query.sort_by] || 'initVotes';

		var pros = Comments.find({ 'replyTo': this.id, 'side': 'pro' }, { 
			sort: setProperty({}, sortBy, -1) 
		}).fetch();

		var	cons = Comments.find({ 'replyTo': this.id, 'side': 'con' }, { 
			sort: setProperty({}, sortBy, -1) 
		}).fetch();

		/** 
		 * Combines the pro and con comments into an array of objects
		 * with the format: {'pros': proComment, 'cons': conComment}
		 *
		 * pair [array] - contains the comment object
		 */
		var comments = _.map(_.zip(pros, cons), function (pair) {
			return {'pros': pair[0], 'cons': pair[1]};
		});

		// a dummy row that solves comment rendering problem (see docs error 1)
		comments.push({'bottom': true});
		return comments;
	}
});










