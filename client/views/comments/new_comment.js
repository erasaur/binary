Template.newComment.rendered = function () {
  var editor = new MediumEditor('.editable', {
    buttonLabels: 'fontawesome',
    buttons: ['bold', 'italic', 'anchor', 'pre', 'header1', 'quote', 'unorderedlist'],
    checkLinkFormat: true,
    cleanPastedHTML: true,
    disableDoubleReturn: true,
    firstHeader: 'h3'
  });
};