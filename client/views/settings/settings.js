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
  isEnabled: function (option) {
    var userId = Meteor.userId();
    return Herald.userPreference(userId, 'email', option) && 'checked' || '';
  }
});

Template.settings.events({
  'change .settings-input input[type="checkbox"]': function (event, template) {
    var button = event.currentTarget;
    var actionValue = button.getAttribute('data-value');
    var newValue = button.checked;

    Herald.setUserPreference(Meteor.user(), { 'email': newValue }, actionValue);
  }
});





















