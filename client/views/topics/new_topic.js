Template.newTopic.events({
  'submit #js-create-topic-form': function(event, template) {
    event.preventDefault();

    var $title = template.$('#js-create-title');
    var $description = template.$('#js-create-description');

    var topic = {
      title: $title.val(),
      description: $description.val()
    };

    Meteor.call('newTopic', topic, function (error, result) {
      if (error) {
        if (error.error === 'logged-out')
          toastr.warning(i18n.t('please_login'));
        else if (error.error === 'wait')
          toastr.warning(i18n.t('please_wait', { num: error.reason }));
        else if (error.error === 'invalid-content')
          toastr.warning(i18n.t('topic_too_short'));
        else if (error.error === 'duplicate-content')
          toastr.warning(i18n.t('topic_title_exists'));
        else
          toastr.warning(i18n.t('error'));
      }
      else {
        $title.val('');
        $description.val('');

        $('#new-topic-modal').modal('hide').on('hidden.bs.modal', function () {
          Router.go('topic', { '_id': result });
        });
      }
    });
  }
});
