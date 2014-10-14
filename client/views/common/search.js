var searching = false;
var searchDeps = new Deps.Dependency();

function stopSearching () {
  $('#js-search-input').val('').blur();
  searching = false;
  searchDeps.changed();
}

function startSearching () {
  searching = true;
  searchDeps.changed();
}

function isSearching () {
  searchDeps.depend();
  return searching;
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
  'focus #js-search-input': function (event, template) {
    startSearching();
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