var searching = new ReactiveVar(false);
var searchTemplate = {
  'topics': 'topicItem',
  'users': 'profileItem'
};

var stopSearching = function () {
  $('.search-input').val('').blur();
  searching.set(false);
};
var isSearching = function () {
  return searching.get();
};

Template.searchInput.helpers({
  indexes: ['topics', 'users'],
  searching: isSearching,
  placeholder: function () {
    return i18n.t('search_prompt');
  }
});

Template.mainLayout.helpers({
  searching: isSearching
});

Template.pageLayout.helpers({
  searching: isSearching
});

Template.nav.events({
  'click .navbar-brand, click .dropdown-menu a[href]': function (event, template) {
    stopSearching();
  }
});

Template.searchInput.events({
  'focus .search-input': function (event, template) {
    searching.set(true);
  },
  'click #js-search-cancel': function (event, template) {
    stopSearching();
  }
});

Template.searchResults.events({
  'submit #js-search-form': function (event, template) {
    event.preventDefault();
  },
  'click a[href]': function (event, template) {
    stopSearching();
  }
});
