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
    allowedValues: ['topics', 'comments']
  },
  status: {
    type: Number, // 0 - pending, 1 - approved
    defaultValue: 0,
    allowedValues: [0,1]
  }
});

Flags = new Mongo.Collection('flags');
Flags.attachSchema(FlagSchema);

Flags.allow({
  insert: canPostById,
  update: isAdminById,
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
  },
  changeFlag: function (flag, newStatus) {
    var user = Meteor.user();

    if (!user || !isAdmin(user))
      throw new Meteor.Error('no-permission', 'This user does not have permission to continue.');

    if (!flag)
      throw new Meteor.Error('invalid-content', 'This content does not meet the specified requirements.');

    var flagId = flag._id;
    var userId = flag.userId;
    var count = newStatus === 0 ? -1 : 1; // decrease helpful flags count if helpful status is retracted

    Flags.update(flagId, { $set: { 'status': newStatus } });
    Meteor.users.update(userId, { $inc: { 'stats.flagsCount': count } });
  }
});