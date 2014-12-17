CampaignSchema = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
    optional: true
  },
  sentAt: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    optional: true
  },
  posts: {
    type: [String],
    optional: true
  }, 
  webHits: {
    type: Number,
    optional: true
  }
});

Campaigns = new Mongo.Collection('campaigns');
Campaigns.attachSchema(CampaignSchema);