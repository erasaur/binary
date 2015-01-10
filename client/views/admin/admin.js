Template.admin.created = function () {
  initInfiniteScroll.call(this, Flags.find());
};
Template.admin.destroyed = function () {
  stopInfiniteScroll.call(this);
};

Template.admin.helpers({
  flags: function () {
    return Flags.find();
  },
  user: function () {
    return Meteor.users.findOne(this.userId);
  },
  item: function () {
    var collection = {
      'comments': Comments,
      'topics': Topics
    };
    var item = collection[this.itemType].findOne(this.itemId);
    item.isCommentItem = true;
    return item;
  },
  itemTemplate: function () {
    var template = {
      'comments': 'comment',
      'topics': 'topicItem'
    };
    return template[this.itemType];
  },
  statusClass: function () {
    return this.status === 1 ? 'js-undo-helpful helpful' : 'js-helpful';
  }
});

Template.admin.events({
  'click .js-helpful': function (event, template) {
    Meteor.call('changeFlag', this, 1);
  },
  'click .js-undo-helpful': function (event, template) {
    Meteor.call('changeFlag', this, 0);
  }
});
