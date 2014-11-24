Template.pageLayout.events({
  // essentially serves as browser back button
  'click #js-back': function (event, template) {
    window.history.back();
  }
});

Template.pageBody.helpers({
  hasItems: function () {
    return _.has(this, 'hasItems') && this.hasItems || this.items.count();
  }
});