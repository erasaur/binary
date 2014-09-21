Template.searchInput.indexes = ["topics", "users"];
Template.searchInput.events({
  "focus #search-input": function (event, template) {
    //searching = true, show results
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