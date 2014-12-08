FlagSchema = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  userId: { // user who flagged
    type: String
  },
  createdAt: {
    type: Date
  },
  reason: {
    type: String,
    max: 100
  },
  itemId: { // item being flagged
    type: String
  },
  itemType: { // topic or comment
    type: String,
    allowedValues: ['topic', 'comment']
  }
});

Flags = new Mongo.Collection('flags');
Flags.attachSchema(FlagSchema);

Flags.allow({
  insert: canPostById,
  update: function () {
    return false;
  },
  remove: function () {
    return false;
  }
});

Meteor.methods({
  newFlag: function (itemId, itemType, reason) {
    var userId = Meteor.userId();

    if (!userId)
      throw new Meteor.Error('no-permission', 'This user does not have permission to continue.');

    Flags.insert({ 
      userId: userId,  
      createdAt: new Date(),
      reason: reason,
      itemId: itemId,
      itemType: itemType
    });
  }
});