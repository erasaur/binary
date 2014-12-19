Template.topic.rendered = function () {
  initInfiniteScroll.call(this, [
    Comments.find({ 'topicId': this.data._id, 'side': 'pro' }), 
    Comments.find({ 'topicId': this.data._id, 'side': 'con' })
  ]); 

  var container = this.find('.list');
  container._uihooks = {
    insertElement: function (node, next) {
      Meteor.setTimeout(function () {
        container.insertBefore(node, next);
        $(node).velocity('slideDown', { duration: 500 });
      }, 1);
    }
  };
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
  commentsCount: function () { 
    // can't do comments.count (not cursor) or comments.length (dummy row)
    return this.commentsCount;
  },
  comments: function () {
    var controller = Iron.controller();
    var runAt = controller._runAt;

    var newComments = Comments.find({
      'replyTo': { $nin: SessionAmplify.get('showingReplies') },
      'topicId': this._id, 
      'userId': Meteor.userId(),
      'createdAt': { $gt: runAt }
    }, { sort: { 'createdAt': -1 } }).fetch();

    var sort = {};
    var query = getCurrentQuery();
    if (!query.sort_by || query.sort_by === 'top') {
      sort.initVotes = -1;
    }
    sort.createdAt = -1; // less priority than initVotes

    var comments = Comments.find({
      'topicId': this._id, 
      'createdAt': { $lt: runAt }
    }, { sort: sort }).fetch();

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

Template.topicButtons.helpers({
	following: function () {
		if (Meteor.user() && Meteor.user().activity && Meteor.user().activity.followingTopics)
			return _.contains(Meteor.user().activity.followingTopics, this._id);
	},
  canFlag: function () {
    var user = Meteor.user();
    return user && !isAdmin(user) && user.flags && !_.contains(user.flags.topics, this._id);
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
  'click #js-flag-topic': function (event, template) {
    var modal = Blaze.renderWithData(Template.flagForm, { _id: this._id, type: 'topics' }, $('body')[0]);
    $('#flag-modal').modal('show').on('hidden.bs.modal', function () {
      Blaze.remove(modal);
    });
  },
	'click #js-delete-topic': function (event, template) {
    if (confirm('Are you sure you want to delete this topic?')) {
      Meteor.call('removeTopic', this, function (error) {
        if (error) {
          if (error.error === 'no-permission')
            alert('Oops! We\'re sorry but we can\'t let you continue.');
          else
            alert('Sorry, something went wrong. Please try again in a moment.');
        }
      });
    }
	}
});


