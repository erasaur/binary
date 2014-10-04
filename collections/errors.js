if (Meteor.isClient) {
  // client-only local collection
  Errors = new Meteor.Collection(null);
}