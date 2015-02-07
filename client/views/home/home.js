Template.home.rendered = function () {
  initInfiniteScroll.call(this, Topics.find());
};

Template.home.destroyed = function () {
  stopInfiniteScroll.call(this);
};

Template.home.helpers({
	topics: function() {
		return Topics.find({}, { sort: { 'score': -1, 'createdAt': -1 } });
	},
	moreTopics: function () {
		return Topics.find().count() === Session.get('itemsLimit');
	}
});
