InfiniteScroll = function (cursor) {
  var count = 0;

  // observeChanges will fire for initial set, so count can start at 0
  this._infiniteScroll = cursor.observeChanges({
    added: function () {
      count++;
    },
    removed: function () {
      count--;
    }
  });

  this.stop = function () {
    cursor.stop();
  };
}

initInfiniteScroll = function (cursors) {
  var cursors = Object.prototype.toString.call(cursors) === '[object Array]' ? 
    cursors : [cursors];
  var self = this;

  self._infiniteScroll = self._infiniteScroll || [];

  _.each(cursors, function (cursor) {
    var obj = new InfiniteScroll(cursor);
    self._infiniteScroll.push(obj);
  });

  $(window).on('scroll', _.throttle(function () {
    // trigger at 300px above bottom
    var target = document.body.offsetHeight - 300;

    if (window.innerHeight + window.scrollY >= target) {
      _.each(self._infiniteScroll, function (obj) {
        if (obj.count >= Session.get('itemsLimit')) {
          Session.set('itemsLimit', Session.get('itemsLimit') + 1); //fetch more items from server
        }
      });
    }
  }, 300));  
};

stopInfiniteScroll = function () {
  $(window).off('scroll');
  this._infiniteScroll && this._infiniteScroll.stop();
};