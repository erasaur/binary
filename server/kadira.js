Meteor.startup(function () {
  Kadira.connect(Meteor.settings.kadiraId, Meteor.settings.kadiraSecret);
});
