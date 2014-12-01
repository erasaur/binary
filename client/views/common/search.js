var searching = new ReactiveVar(false);
var searchIndex = new ReactiveVar('topics');
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
var indexSearching = function () {
  return searchIndex.get();
};

Template.searchInput.helpers({
  searchIndex: indexSearching,
  searching: isSearching
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

Template.searchResults.helpers({
  searchIndex: indexSearching,
  searchTemplate: function () {
    return searchIndex && searchTemplate[searchIndex.get()];
  }
});

Template.searchResults.events({
  'submit #js-search-form': function (event, template) {
    event.preventDefault();
  },
  'click #js-search-topics': function (event, template) {
    searchIndex.set('topics');
  },
  'click #js-search-users': function (event, template) {
    searchIndex.set('users');
    console.log(searchIndex.get());
  },
  // 'click a[href]': function (event, template) {
  //   stopSearching();
  // }
});