Template.replies.helpers({
	hasReplies: function() {
		return CommentsModel.find({$and: [{"replyTo": this.id}, {"side": "pro"}]}).count() || 
					 CommentsModel.find({$and: [{"replyTo": this.id}, {"side": "con"}]}).count();
	},
	replies: function() {
		var pros = CommentsModel.find({"replyTo": this.id, "side": "pro"}).fetch(),
				cons = CommentsModel.find({"replyTo": this.id, "side": "con"}).fetch();

		/** 
		 * Combines the pro and con comments into an array of objects
		 * with the format: {"pros": proComment, "cons": conComment}
		 *
		 * pair - array that contains the comment object
		 */
		return _.map(_.zip(pros, cons), function(pair) {
			return {"pros": pair[0], "cons": pair[1]};
		});
	}
});