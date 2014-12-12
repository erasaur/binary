Meteor.publishComposite('flagsList', function (limit) {
  var userId = this.userId;
  return {
    find: function () {
      if (!userId || !isAdminById(userId)) return this.ready();

      return Flags.find({}, { limit: limit });
    },
    children: [{
      find: function (flag) {
        return Meteor.users.find(flag.userId, { fields: {
          'profile.name': 1, 
          'stats.flagsCount': 1 
        }});
      }
    }, {
      find: function (flag) {
        var collection = {
          'comments': Comments,
          'topics': Topics
        }[flag.itemType];

        return collection && collection.find(flag.itemId);
      }
    }]
  };
});