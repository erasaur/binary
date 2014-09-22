var searching = false;
var searchDeps = new Deps.Dependency();

Template.searchInput.indexes = ["topics", "users"];
Template.searchInput.searching = function () {
  searchDeps.depend();
  return searching;  
}
Template.home.searching = function () {
  searchDeps.depend();
  return searching;
}

function stopSearching () {
  $("#search-input").val('').blur();
  searching = false;
  searchDeps.changed();
}

Template.nav.events({
  "click .navbar-brand": function () {
    stopSearching();
  }
});

Template.searchInput.events({
  "focus #search-input": function (event, template) {
    searching = true;
    searchDeps.changed();
  },
  "click #search-cancel": function (event, template) {
    stopSearching(); 
  }
});

Template.searchResults.events({
  "submit #search-form": function (event, template) {
    event.preventDefault();
  },
  "click .search-link": function (event, template) {
    $("#search-modal").modal("hide");
  }
});