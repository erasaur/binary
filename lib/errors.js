if (Meteor.isClient) {
  throwError = function (message, type) {
    type = (typeof type === 'undefined') ? 'error' : type;
    // store errors in local collection
    Errors.insert({ message: message, type: type, seen: false, show: true });
  };
  clearSeenErrors = function () {
    Errors.update({seen: true}, {$set: {show: false}}, {multi: true});
  };
}