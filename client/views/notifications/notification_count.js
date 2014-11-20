// Template.registerHelper('notificationIcon', new Blaze.Template('notificationBadge', function () {
//   var self = this;
//   var parent = this.parentView;

//   // get template inclusion arguments
//   if (!parent || !parent.__isTemplateWith)
//     var args = {};
//   else
//     var args = parent.dataVar.curValue;

//   if (!args.hasOwnProperty('count'))
//     throw new Meteor.Error('Missing count');

//   var attrs = _.omit(args, 'count');

//   return Blaze.With(Blaze.getData(parent), function () {
//     return HTML.DIV(attrs, self.templateContentBlock, Template.notificationBadge);
//   });
// }));