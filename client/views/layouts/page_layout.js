Template.pageLayout.events({
  // essentially serves as browser back button
  'click #js-back': function (event, template) {
    window.history.back();
  }
});

Template.pageBody.helpers({
  hasItems: function () {
    if (_.has(this, 'hasItems'))
      return this.hasItems;

    return this.items && typeof this.items.count === 'function' && this.items.count();
  }
});