Template.newTopic.events({
  "submit #js-create-topic-form": function(event, template) {
    event.preventDefault();

    var topic = {
      title: template.find("#js-create-title").value,
      description: template.find("#js-create-description").value
    };

    Meteor.call("newTopic", topic, function(error, result) {
      if (error) {
        throwError(formatError(error));
        clearSeenErrors();
        if (error.error == 603)
          Router.go(getTopicRoute(error.details));
      }
      else {
        $("#js-create-title").val("");
        $("#js-create-description").val("");
        $("#new-topic-modal").modal("hide");

        if (getCurrentRoute() === "home")
          scrollToId(result);
      }
    });
  }
});