Template.pageLayout.events({
  // essentially serves as browser back button
  "click .fa-chevron-left": function (event, template) {
    window.history.back();
  }
});