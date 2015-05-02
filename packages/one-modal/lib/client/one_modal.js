OneModal = function (template, options) {
  options = _.extend({}, { data: options }, { template: template });
  var view = Blaze.renderWithData(Template.oneModal, options, document.body);
  $(view.firstNode()).modal('show').on('hidden.bs.modal', function () {
    Blaze.remove(view);
  });
};
