OneModal = function (template, options) {
  _.extend(options, { template: template });
  var view = Blaze.renderWithData(Template.oneModal, options, document.body);
  $(view.firstNode()).modal('show').on('hidden.bs.modal', function () {
    Blaze.remove(view);
  });
};
