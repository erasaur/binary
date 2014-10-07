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

// button jquery object
function displaySaved ($button) {
  var button = $button.find('span');
  var text = button.text(); // original text to be restored

  button.fadeOut(300, function () {
    button.text('Saved!').fadeIn(300).delay(2000).fadeOut(300, function () {
      button.text(text).fadeIn(300);
    });
  });
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
  "click button[data-action='toggle-setting']": function (event, template) {
    var button = event.currentTarget;
    var action = button.getAttribute('data-action');
    var actionValue = button.getAttribute('data-action-value');

    // construct the query key
    actionValue = actionValue.replace(/-/g, '.');
    actionValue = 'profile.notifications.' + actionValue;

    // get the numeric value of toggle (0 or 1)
    var newValue = parseInt(button.getAttribute('value'));

    // { 'profile.notifications.xxx.xxx': true }
    var newPreferences = {};
    newPreferences[actionValue] = !!newValue; // coerce to boolean

    Meteor.call('changePreferences', newPreferences);
  },
  "click #js-edit-name, click #js-edit-bio, click #js-edit-email": function (event, template) {
    var target = event.currentTarget;
    var id = target.id;
    var fieldName = id.substring(id.lastIndexOf('-') + 1); // js-edit-xxx -> xxx
    var fieldId = '#js-' + fieldName; // js-xxx
    var newValue = template.find(fieldId).value;

    var method = 'change' + fieldName.charAt(0).toUpperCase() + fieldName.substring(1);

    Meteor.call(method, newValue, function (error) {
      if (error)
        alert('Sorry, please try to stick to alphanumeric characters, hyphens, periods, and apostrophes!');
      else
        displaySaved($(target));
    });
  },
  "click #js-edit-password": function (event, template) {
    // display inputs for changing password
    $('#js-newPassword').slideDown('fast', function () {
      $('#js-password').removeAttr('disabled').val('').focus();
      $('#js-edit-password').hide();
      $('#js-save-password').show();
    });
  },
  "click #js-save-password": function (event, template) {
    var oldPassword = template.find('#js-password').value;
    var newPassword = template.find('#js-newPassword').value;

    if (newPassword.length < 6)
      alert('Your password must be at least 6 characters long.');
    else {
      Accounts.changePassword(oldPassword, newPassword, function (error) {
        if (error)
          alert('Please verify that you have entered the correct password.');
        else {
          $('#js-newPassword').slideUp('fast', function () {
            $('#js-password').prop('disabled', true).val('○○○○○○○');
            $('#js-newPassword').val('');
            $('#js-save-password').hide();

            displaySaved($('#js-edit-password'));
            $('#js-edit-password').show();
          });
        }
      });  
    }
  }
});





















