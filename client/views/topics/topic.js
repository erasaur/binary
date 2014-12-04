Template.topic.rendered = function () {
  initInfiniteScroll.call(this, [
    Comments.find({ 'topicId': this.data._id, 'side': 'pro' }), 
    Comments.find({ 'topicId': this.data._id, 'side': 'con' })
  ]); 

  var container = this.find('.list');
  container._uihooks = {
    insertElement: function (node, next) {
      container.insertBefore(node, next);
      $(node).velocity('slideDown', { duration: 100 });
      console.log('added');
    },
    // moveElement: function (node, next) {
    //   container.insertBefore(node, next);
    //   console.log('moved');
    // },
    // removeElement: function (node) {
    //   console.log(node);
    //   // $(node).remove();
    //   console.log('removed');
    // }
  }
};
Template.topic.destroyed = function () {
  stopInfiniteScroll.call(this);
};
Template.topicHeader.rendered = function () {
  var description = this.find('.topic-description');
  var $description = $(description);

  if (!$description || !$description.length) return;

  if (description.scrollHeight > $description.innerHeight()) {
    $description.addClass('collapsible');
  }
};

Template.topic.helpers({
  commentCategory: function () {
    var query = getCurrentQuery();
    return query && camelToTitle(query.sort_by) || 'Top';
  },
  hasComments: function () { 
    // can't do comments.count (not cursor) or comments.length (dummy row)
    return this.commentsCount;
  },
  comments: function () {
    var sortOptions = {
      'top': 'initVotes',
      'newest': 'initDate'
    };
    var query = getCurrentQuery();
    var sortBy = query && sortOptions[query.sort_by] || 'initVotes';

    // var newPros = Comments.find({
    //   'replyTo': { $nin: SessionAmplify.get('showingReplies') }, 
    //   'topicId': this._id, 
    //   'side': 'pro',
    //   'initDate': { $exists: false }
    // }, { sort: { 'createdAt': -1 } }).fetch();

    // var newCons = Comments.find({
    //   'replyTo': { $nin: SessionAmplify.get('showingReplies') }, 
    //   'topicId': this._id, 
    //   'side': 'con',
    //   'initDate': { $exists: false }
    // }, { sort: { 'createdAt': -1 } }).fetch();

    // var pros = Comments.find({
    //             'replyTo': { $nin: SessionAmplify.get('showingReplies') }, 
    //             'topicId': this._id, 
    //             'side': 'pro',
    //             'initDate': { $exists: true }
    //           }, { sort: setProperty({}, sortBy, -1) }).fetch();
    // var cons = Comments.find({
    //             'replyTo': { $nin: SessionAmplify.get('showingReplies') }, 
    //             'topicId': this._id, 
    //             'side': 'con',
    //             'initDate': { $exists: true }
    //           }, { sort: setProperty({}, sortBy, -1) }).fetch();

    var res = [];

    var controller = Iron.controller();
    // var runAt = controller.state.get('runAt');
    var runAt = controller._runAt;

    var newComments = Comments.find({
      'replyTo': { $nin: SessionAmplify.get('showingReplies') }, 
      'topicId': this._id, 
      'userId': Meteor.userId(),
      // 'initDate': { $exists: false }
      'createdAt': { $gt: runAt }
    }, { sort: { 'createdAt': -1 } }).fetch();

    var sort = setProperty({}, sortBy, -1);
    sort.createdAt = -1;
    var comments = Comments.find({
      'replyTo': { $nin: SessionAmplify.get('showingReplies') }, 
      'topicId': this._id, 
      // 'initDate': { $exists: true }
      'createdAt': { $lt: runAt }
    }, { sort: sort }).fetch();

    // var comments = Comments.find({
    //   'replyTo': { $nin: SessionAmplify.get('showingReplies') }, 
    //   'topicId': this._id
    // }, { sort: sort }).fetch();

    var comments = _.union(newComments, comments);
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
     * pair - array that contains the comment object
     */
    // var comments = _.map(_.zip(pros, cons), function (pair) { 
    //   return { 'pros': pair[0], 'cons': pair[1] };
    // });
    //a dummy row that solves comment rendering (see docs error 1)
    res.push({ 'bottom': true });
    return res;
  }
});

Template.topicButtons.helpers({
	following: function () {
		if (Meteor.user() && Meteor.user().activity && Meteor.user().activity.followingTopics)
			return _.contains(Meteor.user().activity.followingTopics, this._id);
	}
});

Template.topicHeader.helpers({
  selected: function (side) {
    var userId = Meteor.userId();
    var side = side + 'Users';

    return userId && _.contains(this[side], userId) && 'selected';
  }
});

Template.topicHeader.events({
  'click .collapsible': function (event, template) {
    template.$('.topic-description').toggleClass('collapsed');
  },
	'click #js-vote-pro': function (event, template) {
		Meteor.call('vote', this, 'pro');
	},
	'click #js-vote-con': function (event, template) {
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


