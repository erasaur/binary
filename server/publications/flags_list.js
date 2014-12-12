// Meteor.publish('flagsList', function (limit) {
//   if (!this.userId || !isAdminById(this.userId)) return this.ready();

//   var pub = this;
//   var flags = Flags.find({}, { limit: limit });

//   var flagsHandle = flags.observeChanges({
//     added: function (id, fields) {
//       publishFlagUser(fields.userId);
//       publishFlagItem(fields.itemId, fields.itemType);
//       pub.added('flags', id, fields);
//     },
//     changed: function (id, fields) {
//       pub.changed('flags', id, fields);
//     },
//     removed: function (id) {
//       pub.removed('flags', id);
//     }
//   });

//   function publishFlagUser (userId) {
//     var user = Meteor.users.findOne(userId, { fields: { 
//       'profile.name': 1, 
//       'stats.flagsCount': 1 
//     }});
//     pub.added('users', userId, user);
//   }

//   function publishFlagItem (itemId, itemType) {
//     var collection = {
//       'comments': Comments,
//       'topics': Topics
//     }[itemType];

//     var item = collection && collection.findOne(itemId);
//     pub.added(itemType, itemId, item);
//   }

//   pub.ready();

//   pub.onStop(function () {
//     flagsHandle.stop();
//   });
// });

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