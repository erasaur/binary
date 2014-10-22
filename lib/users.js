isAdminById = function (userId) {
  var user = Meteor.users.findOne(userId);
  return !!(user && isAdmin(user));
};
isAdmin = function (user) {
  user = (typeof user === 'undefined') ? Meteor.user() : user;
  return !!user && !!user.isAdmin;
};
getDisplayName = function (user) {
  return user && user.profile && user.profile.name;
};
getDisplayNameById = function (userId) {
  return getDisplayName(Meteor.users.findOne(userId));
};
getEmail = function (user) {
  return user && user.emails && user.emails[0].address;
};
findLast = function (user, collection) {
  return collection.findOne({ userId: user._id }, { sort: { createdAt: -1 } });
};
timeSinceLast = function (user, collection) {
  var now = new Date().getTime();
  var last = findLast(user, collection);
  if(!last)
    return 999; // if this is the user's first post or comment ever, stop here
  return Math.abs(Math.floor((now - last.createdAt) / 1000));
};
numberOfItemsInPast24Hours = function (user, collection) {
  var date = moment(new Date());
  var items = collection.find({
    userId: user._id,
    createdAt: { $gte: createdAt.subtract(24, 'hours').valueOf() }
  });
  return items.count();
};













