var searching = new ReactiveVar(false);
var searchDeps = new Deps.Dependency();

function stopSearching () {
  // $('#js-search-input').val('').blur();
  searching.set(false);
}

function isSearching () {
  return searching.get();
}

Template.searchInput.helpers({
  indexes: ['topics', 'users'],
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

Template.searchResults.events({
  'submit #js-search-form': function (event, template) {
    event.preventDefault();
  },
  'click a[href]': function (event, template) {
    stopSearching();
  }
});