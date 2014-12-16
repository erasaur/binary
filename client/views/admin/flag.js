Template.flagForm.events({
  'change input[name="flag-option"][value="other"]': function (event, template) {
    template.$('#js-other-reason').prop('disabled', false);
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
          alert('Please log in before continuing. Thank you!');
        else
          alert('Make sure you provide a valid reason for flagging. Thank you!');
      } else {
        alert('Thank you for helping keep Binary clean!');
        template.$('#flag-modal').modal('hide');
      }
    });
  }
});