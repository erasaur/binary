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
    var userId = Meteor.userId();

    return userId && Herald.userPreference(userId, 'email', option) == value ? 
      'btn-primary' : 'btn-default';
  }
});

Template.settings.events({
  'click button[data-action="toggle-setting"]': function (event, template) {
    var button = event.currentTarget;
    var actionValue = button.getAttribute('data-action-value');
    var newValue = !!parseInt(button.getAttribute('value')); // 0 or 1

    // toggling global notifications
    if (!actionValue) {
      Herald.setUserPreference(Meteor.user(), { 'email': newValue });
    } 

    // toggling courier specific preferences
    else {
      actionValue = actionValue.replace(/-/g, '.');
      Herald.setUserPreference(Meteor.user(), { 'email': newValue }, actionValue);
    }
  }
});





















