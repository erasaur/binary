Template.topicComments.helpers({
  commentCategory: function () {
    return camelToTitle(Router.current().params.sort_by || 'upvotes');
  },
  hasComments: function () { 
    // can't do comments.count (not cursor) or comments.length (dummy row)
    return Comments.find({'topicId': this._id}).count() > 0;
  },
  comments: function () {
    var sortOptions = {
      'top': 'initVotes',
      'newest': 'initDate'
    };
    var sortBy = sortOptions[Router.current().params.sort_by] || 'initVotes';

    var pros = Comments.find({
                'replyTo': {$nin: SessionAmplify.get('showingReplies')}, 
                'topicId': this._id, 
                'side': 'pro'
              }, { sort: setProperty({}, sortBy, -1) }).fetch();
    var cons = Comments.find({
                'replyTo': {$nin: SessionAmplify.get('showingReplies')}, 
                'topicId': this._id, 
                'side': 'con'
              }, { sort: setProperty({}, sortBy, -1) }).fetch();

    /** 
     * Combines the pro and con comments into an array of objects
     * with the format: {'pros': proComment, 'cons': conComment}
     *
     * pair - array that contains the comment object
     */
    var comments = _.map(_.zip(pros, cons), function(pair) { 
      return {'pros': pair[0], 'cons': pair[1]};
    });
    //a dummy row that solves comment rendering (see docs error 1)
    comments.push({'bottom': true});
    return comments;
  }
});