Template.home.onCreated(function () {
  initInfiniteScroll.call(this, Topics.find({}, { fields: { '_id': 1 } }));
});

Template.home.onDestroyed(function () {
  stopInfiniteScroll.call(this);
});

Template.home.helpers({
	topics: function() {
		return Topics.find({}, { sort: { 'score': -1, 'createdAt': -1 } });
	},
	moreTopics: function () {
    var controller = getCurrentController();
		return Topics.find({}, { fields: { '_id': 1 } }).count() === controller.state.get('itemsLimit');
	}
});
