function InfiniteScroll (cursor) {
  var self = this;

  // observeChanges will fire for initial set, so count can start at 0
  self.count = 0;
  var cursor = cursor.observeChanges({
    added: function () {
      self.count++;
    },
    removed: function () {
      self.count--;
    }
  });

  this.stop = function () {
    cursor.stop();
  };
}

initInfiniteScroll = function (cursors) {
  var self = this;
  var cursors = _.isArray(cursors) ? cursors : [cursors];
  var controller = getCurrentController();
  var limit = this.state || controller.state;
  var currentLimit;

  self._infiniteScroll = self._infiniteScroll || [];

  _.each(cursors, function (cursor) {
    var obj = new InfiniteScroll(cursor);
    self._infiniteScroll.push(obj);
  });

  $(window).on('scroll', _.throttle(function () {
    // trigger at 20% above bottom
    var target = document.body.offsetHeight * 0.8;

    if (window.innerHeight + window.scrollY >= target) {
      _.each(self._infiniteScroll, function (obj) {
        currentLimit = limit.get('itemsLimit');
        if (obj.count >= currentLimit) {
          limit.set('itemsLimit', currentLimit + 30); //fetch more items from server
        }
      });
    }
  }, 300));
};

stopInfiniteScroll = function () {
  $(window).off('scroll');
  _.each(this._infiniteScroll, function (obj) {
    obj.stop();
  });
};
