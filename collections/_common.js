afAutoMarkdown = function (forField) {
  return function () {
    var content = this.field(forField);
    if (Meteor.isServer && typeof content.value === 'string') {
      return markdownToHTML(content.value);
    }
  };
};
