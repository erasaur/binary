Template.topic.rendered = function () {
  initInfiniteScroll.call(this, 'comments');

  var container = this.find('.page-body-content .list');
  
  container._uihooks = {
    insertElement: function (node, next) {
      container.insertBefore(node, next);

      var $node = $(node).find('.comment-content');

      if (!$node) return;
      $node.each(function () {
        var $comment = $(this);
        if (this.scrollHeight > $comment.innerHeight()) {
          $comment.parent().addClass('comment-collapsible');
        }
      });
    }
  };
};
Template.topic.destroyed = function () {
  stopInfiniteScroll.call(this);
};

Template.topic.helpers({
  commentCategory: function () {
    var query = getCurrentQuery();
    return query && camelToTitle(query.sort_by) || 'Top';
  },
  hasComments: function () { 
    // can't do comments.count (not cursor) or comments.length (dummy row)
    return Comments.find({ 'topicId': this._id }).count() > 0;
  },
  comments: function () {
    var sortOptions = {
      'top': 'initVotes',
      'newest': 'initDate'
    };
    var query = getCurrentQuery();
    var sortBy = query && sortOptions[query.sort_by] || 'initVotes';

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
    var comments = _.map(_.zip(pros, cons), function (pair) { 
      return { 'pros': pair[0], 'cons': pair[1] };
    });
    //a dummy row that solves comment rendering (see docs error 1)
    comments.push({ 'bottom': true });
    return comments;
  }
});

Template.topicButtons.helpers({
	following: function () {
		if (Meteor.user() && Meteor.user().activity && Meteor.user().activity.followingTopics)
			return _.contains(Meteor.user().activity.followingTopics, this._id);
	}
});

Template.topicHeader.events({
	'click #js-vote-pro': function(event, template) {
		Meteor.call('vote', this, 'pro');
	},
	'click #js-vote-con': function(event, template) {
		Meteor.call('vote', this, 'con');
	}
});

Template.topicButtons.events({
	'click #js-follow': function (event, template) {
		Meteor.call('followTopic', this._id, function (error) {
			if (error) {
				if (error.error === 'logged-out')
					alert('Please log in to follow topics. Thank you!');
				else
					alert('Sorry, something went wrong. Please try again in a moment.');
			}
		});
	},
	'click #js-unfollow': function (event, template) {
		Meteor.call('unfollowTopic', this._id, function (error) {
			if (error) {
				if (error.error === 'logged-out')
					alert('Please log in to follow topics. Thank you!');
				else
					alert('Sorry, something went wrong. Please try again in a moment.');
			}
		});
	},
	'click #js-delete-topic': function (event, template) {
		Meteor.call('removeTopic', this, function (error) {
			if (error) {
				if (error.error === 'no-permission')
					alert('Oops! We\'re sorry but we can\'t let you continue.');
				else
					alert('Sorry, something went wrong. Please try again in a moment.');
			}
		});
	}
});


