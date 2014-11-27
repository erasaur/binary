Template.pageLayout.events({
  // essentially serves as browser back button
  'click #js-back': function (event, template) {
    window.history.back();
  }
});

Template.pageBody.helpers({
  hasItems: function () {
    if (!this.items)
      return;

    if (this.hasItems || this.items.length)
      return this.hasItems || this.items.length;

    return this.items && typeof this.items.count === 'function' && this.items.count();
  }
});