Template.replies.rendered = function () {
  var container = this.firstNode;
  container._uihooks = {
    insertElement: function (node, next) {
      Meteor.setTimeout(function () {
        container.insertBefore(node, next);
        $(node).velocity('slideDown', { duration: 500 });
      }, 1);
    }
  }
};

Template.replies.helpers({
	hasReplies: function () {
    var comment = Comments.findOne(this.id);
		return comment && comment.replies.length;
	},
	replies: function () {
		var controller = Router.current();
		var runAt = controller._runAt;

    var newComments = Comments.find({ 'replyTo': this.id, 'createdAt': { $gt: runAt }, 'userId': Meteor.userId() }, { 
    	sort: { 'createdAt': -1 } 
    }).fetch();

    var sort = {};
    var query = getCurrentQuery();
    if (!query.sort_by || query.sort_by === 'top') {
      sort.initVotes = -1;
    }
    sort.createdAt = -1; // less priority than initVotes
    
    var comments = Comments.find({ 'replyTo': this.id, 'createdAt': { $lt: runAt } }, { 
    	sort: sort 
    }).fetch();

    var comments = newComments.concat(comments);
    var res = [], pros = [], cons = [], comment;

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

		res.push({ 'bottom': true });
    return res;
	}
});










