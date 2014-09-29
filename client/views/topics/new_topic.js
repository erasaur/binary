Template.newTopic.events({
  "submit #create-topic-form": function(event, template) {
    event.preventDefault();
    var title = template.find("#create-title").value;
    // var description = template.find("#create-description").value;

    Meteor.call("newTopic", Meteor.userId(), title, function(error, result) {
      if (error)
        alert(formatError(error));
      else {
        $("#create-title").val("");
        $("#create-description").val("");
        $("#new-topic-modal").modal("hide");

        if (getCurrentRoute() === "home")
          scrollToId(result);
      }
    });
  }
});