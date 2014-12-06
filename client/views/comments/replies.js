Template.replies.rendered = function () {
	var container = this.find('.comment-container');
	container._uihooks = {
		insertElement: function (node, next) {
			container.insertBefore(node, next);
			$(node).velocity('slideDown', { duration: 100 });
		}
	}
};

Template.replies.helpers({
	hasReplies: function () {
    var comment = Comments.findOne(this._id);
		return comment && comment.replies.length;
	},
	replies: function () {
		var sortOptions = {
      'top': 'initVotes',
      'newest': 'initDate'
    };
    var query = getCurrentQuery();
    var sortBy = query && sortOptions[query.sort_by] || 'initVotes';

		// var pros = Comments.find({ 'replyTo': this.id, 'side': 'pro' }, { 
		// 	sort: setProperty({}, sortBy, -1) 
		// }).fetch();

		// var	cons = Comments.find({ 'replyTo': this.id, 'side': 'con' }, { 
		// 	sort: setProperty({}, sortBy, -1) 
		// }).fetch();

		var res = [];
		var controller = Router.current();
		// console.log(Iron, controller);

		// var runAt = controller.state.get('runAt');
		var runAt = controller._runAt;

    var newComments = Comments.find({ 'replyTo': this.id, 'createdAt': { $gt: runAt }, 'userId': Meteor.userId() }, { 
    	sort: { 'createdAt': -1 } 
    }).fetch();

    var sort = setProperty({}, sortBy, -1);
    sort.createdAt = -1;
    var comments = Comments.find({ 'replyTo': this.id, 'createdAt': { $lt: runAt } }, { 
    	sort: sort 
    }).fetch();

    var comments = newComments.concat(comments);

    var pros = [], cons = [], comment;
    var len = comments.length, i = 0;
    while (i < len) {
      comment = comments[i];
      comment.side === 'pro' ? pros.push(comment) : cons.push(comment);
      i++;
    }

    var len = Math.max(pros.length, cons.length), i = 0;
    while (i < len) {
      res.push({ 'pros': pros[i], 'cons': cons[i] });
      i++;
    }

		/** 
		 * Combines the pro and con comments into an array of objects
		 * with the format: {'pros': proComment, 'cons': conComment}
		 *
		 * pair [array] - contains the comment object
		 */
		// var comments = _.map(_.zip(pros, cons), function (pair) {
		// 	return {'pros': pair[0], 'cons': pair[1]};
		// });

		// a dummy row that solves comment rendering problem (see docs error 1)
		// comments.push({'bottom': true});
		// return comments;

		res.push({ 'bottom': true });
    return res;
	}
});










