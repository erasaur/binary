Template.newTopic.events({
  'submit #js-create-topic-form': function(event, template) {
    event.preventDefault();

    var topic = {
      title: template.find('#js-create-title').value,
      description: template.find('#js-create-description').value
    };

    Meteor.call('newTopic', topic, function (error, result) {
      if (error) {
        if (error.error === 'logged-out')
          alert('Please login to post a topic. Thank you!');
        else if (error.error === 'invalid-content')
          alert('Sorry, the topic title has to have at least 8 characters.'); 
        else if (error.error === 'duplicate-content')
          alert('Sorry, there is already a topic with that title.');
        else
          alert('Sorry, something went wrong. Please try again in a moment.');
      }
      else {
        $('#js-create-title').val('');
        $('#js-create-description').val('');
        $('#new-topic-modal').modal('hide');

        $('#new-topic-modal').on('hidden.bs.modal', function () {
          Router.go('topic', { '_id': result });
        });
      }
    });
  }
});