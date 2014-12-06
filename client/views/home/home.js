Template.home.rendered = function () {
  initInfiniteScroll.call(this, Topics.find());
};

Template.home.destroyed = function () {
  stopInfiniteScroll.call(this);
};

Template.home.helpers({
	topics: function() {
		return Topics.find();
	},
	moreTopics: function () {
		return Topics.find().count() === Session.get('itemsLimit');
	}
});