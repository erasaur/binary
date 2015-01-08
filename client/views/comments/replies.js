Template.replies.rendered = function () {
  var container = this.firstNode;
  container._uihooks = {
    insertElement: function (node, next) {
      var $node = $(node);
      if ($node.hasClass('comment-container')) {
        Meteor.setTimeout(function () {
          $node.insertBefore(next);
          $node.velocity('slideDown', { duration: 200 });
          Meteor.setTimeout(function () { $node.css('opacity', 1); }, 1);
        }, 1);
      } else {
        $node.insertBefore(next);
      }
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










