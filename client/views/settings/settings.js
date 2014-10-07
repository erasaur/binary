Template.settings.events({
  "click #js-back": function (event, template) {
    window.history.back();
  }
});

// http://stackoverflow.com/questions/8750362/using-variables-with-nested-javascript-object
function leaf (obj, path) {
  path = path.split('.');
  var res = obj;
  for (var i = 0; i < path.length; i++) 
    res = res[path[i]];
  return res;
}

Template.settings.helpers({
  "isEnabled": function (option) {
    if (Meteor.user())
      return leaf(Meteor.user().profile.notifications, option) ? 'btn-primary' : 'btn-default';
  },
  "unlessEnabled": function (option) {
    if (Meteor.user())
      return leaf(Meteor.user().profile.notifications, option) ? 'btn-default' : 'btn-primary';
  }
});

Template.settings.events({
  "click button[data-action]": function (event, template) {
    var action = event.target.getAttribute('data-action');

    if (action === 'toggle-setting') {
      var properties = event.target.getAttribute('data-action-value');
      properties = properties.replace(/-/g, '.');

      // construct the query key
      properties = 'profile.notifications.' + properties;

      // get the numeric value of toggle (0 or 1)
      var newValue = parseInt(event.target.getAttribute('value'));

      // { 'profile.notifications.xxx.xxx': true }
      var newPreferences = {};
      newPreferences[properties] = !!newValue; // coerce to boolean

      Meteor.call('changePreferences', newPreferences);
    } 
    else if (action === 'edit-account-password') {
      // show another input
    }
    else {
      var fieldId = '#js-' + action; // js-edit-xxx
      var newValue = template.find(fieldId).value;
      var fieldName = action.substring(action.indexOf('-') + 1); // edit-xxx -> xxx

      var method = 'change' + fieldName.charAt(0).toUpperCase() + fieldName.substring(1);
      Meteor.call(method, newValue, function (error) {
        if (error)
          alert('Sorry, please try to stick to alphanumeric characters!');
      });
    }
  }
})