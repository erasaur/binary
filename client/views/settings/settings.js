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
    var button = event.currentTarget;
    var action = button.getAttribute('data-action');
    var actionValue = button.getAttribute('data-action-value');

    if (action === 'toggle-setting') {
      // construct the query key
      actionValue = actionValue.replace(/-/g, '.');
      actionValue = 'profile.notifications.' + actionValue;

      // get the numeric value of toggle (0 or 1)
      var newValue = parseInt(button.getAttribute('value'));

      // { 'profile.notifications.xxx.xxx': true }
      var newPreferences = {};
      newPreferences[properties] = !!newValue; // coerce to boolean

      Meteor.call('changePreferences', newPreferences);
    } 

    else if (action === 'edit-password') {
      // display inputs for changing password
      $('#js-edit-newPassword').slideDown('fast', function () {
        $('#js-edit-password').removeAttr('disabled').val('').focus();
        $('#js-btn-edit-password').hide();
        $('#js-btn-save-password').show();
      });
    }

    else {
      var fieldName = action.substring(action.indexOf('-') + 1); // edit-xxx -> xxx
      var fieldId = '#js-' + action; // js-edit-xxx
      var newValue = template.find(fieldId).value;

      var method = 'change' + fieldName.charAt(0).toUpperCase() + fieldName.substring(1);

      Meteor.call(method, newValue, function (error) {
        if (error)
          alert('Sorry, please try to stick to alphanumeric characters, hyphens, periods, and apostrophes!');
        else {
          var btnText = $(button).find('span');
          btnText.fadeOut(300, function () {
            btnText.text('Saved!').fadeIn(300).delay(2000).fadeOut(300, function () {
              btnText.text('Save').fadeIn(300);
            });
          });
        }
      });
    }
  },
  "click #js-btn-save-password": function (event, template) {
    var oldPassword = template.find('#js-edit-password').value;
    var newPassword = template.find('#js-edit-newPassword').value;

    if (newPassword.length < 6)
      alert('Your password must be at least 6 characters long.');
    else {
      Accounts.changePassword(oldPassword, newPassword, function (error) {
        if (error)
          alert('Please verify that you have entered the correct password.');
        else {
          $('#js-edit-newPassword').slideUp('fast', function () {
            $('#js-edit-password').prop('disabled', true).val('○○○○○○○');
            $('#js-edit-newPassword').val('');
            $('#js-btn-save-password').hide();
            $('#js-btn-edit-password').show();
          });
        }
      });  
    }
  }
});





















