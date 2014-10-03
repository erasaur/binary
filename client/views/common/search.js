var searching = false;
var searchDeps = new Deps.Dependency();

function stopSearching () {
  $("#js-search-input").val('').blur();
  searching = false;
  searchDeps.changed();
}

Template.searchInput.indexes = ["topics", "users"];
Template.searchInput.searching = function () {
  searchDeps.depend();
  return searching;  
}
Template.home.searching = function () {
  searchDeps.depend();
  return searching;
}

Template.nav.events({
  "click .navbar-brand": function () {
    stopSearching();
  }
});

Template.searchInput.events({
  "focus #js-search-input": function (event, template) {
    searching = true;
    searchDeps.changed();
  },
  "click #js-search-cancel": function (event, template) {
    stopSearching(); 
  }
});

Template.searchResults.events({
  "submit #js-search-form": function (event, template) {
    event.preventDefault();
  },
  "click .js-search-link": function (event, template) {
    $("#search-modal").modal("hide");
  }
});