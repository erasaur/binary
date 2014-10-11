Template.pageLayout.events({
  // essentially serves as browser back button
  'click #js-back': function (event, template) {
    window.history.back();
  }
});