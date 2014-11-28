// // button jquery object
// function displaySaved ($button) {
//   var button = $button.find('span');
//   var text = button.text(); // original text to be restored

//   button.fadeOut(300, function () {
//     button.text('Saved!').fadeIn(300).delay(2000).fadeOut(300, function () {
//       button.text(text).fadeIn(300);
//     });
//   });
// }

Template.settingsBody.created = function () {
  this.editing = new ReactiveVar(false);
};

Template.settingsBody.helpers({
  editing: function () {
    return Template.instance().editing.get();
  }
});

Template.settingsBody.events({
  'focus input': function (event, template) {
    template.editing.set(true);
  },
  'click #js-cancel-edit, submit form': function (event, template) {
    event.preventDefault();
    template.editing.set(false);
  }
});

Template.settings.helpers({
  'isEnabled': function (option, value) {
    if (!Meteor.user()) return;

    var medium = '.onsite'; // use user preferences ?
    return getProperty(Meteor.user().profile.notifications, option + medium) == value ? 
      'btn-primary' : 'btn-default';
  }
});

Template.settings.events({
  'click button[data-action="toggle-setting"]': function (event, template) {
    var button = event.currentTarget;
    var actionValue = button.getAttribute('data-action-value');
    var newValue = parseInt(button.getAttribute('value')); // 0 or 1
    var medium = '.onsite'; // medium of delivering notifications

    // toggling global notifications
    if (!actionValue) {
      // use Herald setUserPreference ?
      Meteor.call('changePreferences', setProperty({}, 'profile.notifications.media' + medium, !!newValue));
    } 
    // toggling courier specific preferences
    else {
      // construct the query key
      actionValue = actionValue.replace(/-/g, '.');
      actionValue = 'profile.notifications.couriers.' + actionValue + medium;

      // eg { 'profile.notifications.couriers.newComment.follower.onsite': true }
      Meteor.call('changePreferences', setProperty({}, actionValue, !!newValue));
    }
  },
  
  // 'click #js-edit-name, click #js-edit-bio, click #js-edit-email': function (event, template) {
  //   var target = event.currentTarget;
  //   var id = target.id;
  //   var fieldName = id.substring(id.lastIndexOf('-') + 1); // js-edit-xxx -> xxx
  //   var fieldId = '#js-' + fieldName; // js-xxx
  //   var newValue = template.find(fieldId).value;

  //   var method = 'change' + fieldName.charAt(0).toUpperCase() + fieldName.substring(1);

  //   Meteor.call(method, newValue, function (error) {
  //     if (error) {
  //       console.log(error.invalidKeys);
  //       alert('Sorry, please try to stick to alphanumeric characters, hyphens, periods, and apostrophes!');
  //     }
  //     else {
  //       displaySaved($(target));
  //       if (fieldName === 'email')
  //         alert('Please check your email for a verification link. Thanks!');
  //     }
  //   });
  // },
  // 'click #js-save-password': function (event, template) {
  //   var oldPassword = template.find('#js-password').value;
  //   var newPassword = template.find('#js-newPassword').value;

  //   if (newPassword.length < 6)
  //     alert('Your password must be at least 6 characters long.');
  //   else {
  //     Accounts.changePassword(oldPassword, newPassword, function (error) {
  //       if (error)
  //         alert('Please verify that you have entered the correct password.');
  //       else {
  //         $('#js-newPassword').slideUp('fast', function () {
  //           $('#js-password').prop('disabled', true).val('○○○○○○○');
  //           $('#js-newPassword').val('');
  //           $('#js-editing-password').hide();

  //           displaySaved($('#js-edit-password'));
  //           $('#js-edit-password').show();
  //         });
  //       }
  //     });  
  //   }
  // }
});





















