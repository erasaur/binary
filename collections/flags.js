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

Flags.deny({
  insert: function () {
    return true;
  },
  update: function () {
    return true;
  },
  remove: function () {
    return true;
  }
});

