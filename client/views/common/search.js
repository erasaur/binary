var searching = false;
var searchDeps = new Deps.Dependency();

function stopSearching () {
  $("#js-search-input").val('').blur();
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

Template.searchInput.indexes = ["topics", "users"];

Template.searchInput.searching = isSearching;
Template.mainLayout.searching = isSearching;
Template.pageLayout.searching = isSearching;

Template.nav.events({
  "click .navbar-brand": function () {
    stopSearching();
  }
});

Template.searchInput.events({
  "focus #js-search-input": function (event, template) {
    startSearching();
  },
  "click #js-search-cancel": function (event, template) {
    stopSearching(); 
  }
});

Template.searchResults.events({
  "submit #js-search-form": function (event, template) {
    event.preventDefault();
  }
});