Template.home.rendered = function () {
  this._infiniteScroll = initInfiniteScroll('topics');
};

Template.home.destroyed = function () {
  console.log('search and destroy!');
  $(window).off('scroll');
  this._infiniteScroll && this._infiniteScroll.stop();
};

Template.home.helpers({
	topics: function() {
		return Topics.find();
	},
	moreTopics: function () {
		return Topics.find().count() > Session.get('topicsLimit');
	}
});