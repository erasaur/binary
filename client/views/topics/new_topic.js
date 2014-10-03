Template.newTopic.events({
  "submit #js-create-topic-form": function(event, template) {
    event.preventDefault();
    var title = template.find("#js-create-title").value;
    // var description = template.find("#create-description").value;

    Meteor.call("newTopic", Meteor.userId(), title, function(error, result) {
      if (error)
        alert(formatError(error));
      else {
        $("#js-create-title").val("");
        $("#js-create-description").val("");
        $("#js-new-topic-modal").modal("hide");

        if (getCurrentRoute() === "home")
          scrollToId(result);
      }
    });
  }
});