Template.replies.rendered = function () {
  var container = this.firstNode;
  container._uihooks = {
    insertElement: function (node, next) {
      Meteor.setTimeout(function () {
        // container.insertBefore(node, next);
        var $node = $(node);
        $node.insertBefore(next);
        if ($node.hasClass('comment-container')) {
          $node.velocity('slideDown', { duration: 500 });
        }
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
    var incomingComments = getIncomingComments({ 'replyTo': this.id });
    var comments = getComments({ 'replyTo': this.id });

    comments = incomingComments.concat(comments);
    var pros = [], cons = [];

    _.each(comments, function (comment) {
      comment.side === 'pro' ? pros.push(comment) : cons.push(comment);
    });

    var res = [], len = Math.max(pros.length, cons.length), i = -1;
    while (++i < len) {
      res.push({ 'pros': pros[i], 'cons': cons[i] });
    }

    res.push({ 'bottom': true });
    return res;
	}
});










