Template.flagForm.events({
  'change input[name="flag-option"]': function (event, template) {
    var $input = template.$('#js-other-reason');
    $input.prop('disabled', event.target.value !== 'other');
  },
  'submit #js-flag-form': function (event, template) {
    event.preventDefault();

    var $form = $(event.target);
    var reason = $form.find('input:radio:checked').val();
    if (!reason) return;

    if (reason === 'other') {
      reason = $form.find('#js-other-reason').val();
    }

    Meteor.call('newFlag', this._id, this.type, reason, function (error, result) {
      if (error) {
        if (error.error === 'no-permission')
          toastr.warning(i18n.t('please_login'));
        else
          toastr.warning(i18n.t('missing_fields'));
      } else {
        toastr.success(i18n.t('thank_you_for_flagging'));
        template.$('#flag-modal').modal('hide');
      }
    });
  }
});
