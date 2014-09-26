Template.newTopic.events({
  "submit #create-topic-form": function(event, template) {
    event.preventDefault();
    var title = template.find("#create-title").value;
    // var description = template.find("#create-description").value;

    Meteor.call("newTopic", title, Meteor.userId(), Meteor.user().username, function(error, result) {
      if(error)
        alert(formatError(error));
      else {
        $("#create-title").val("");
        // $("#create-description").val("");
      }
    });
  }
});