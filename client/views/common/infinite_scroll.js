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
    console.log(cursor);
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
    console.log(obj);
    self._infiniteScroll.push(obj);
  });

  if (!Session.get('itemsLimit')) {
    console.log('items limit reset');
    Session.set('itemsLimit', 2);
  }

  $(window).on('scroll', _.throttle(function () {
    // trigger at 300px above bottom
    var target = document.body.offsetHeight - 300;

    if (window.innerHeight + window.scrollY >= target) {
      _.each(self._infiniteScroll, function (obj) {
        console.log(obj.count, Session.get('itemsLimit'));
        if (obj.count >= Session.get('itemsLimit')) {
          Session.set('itemsLimit', Session.get('itemsLimit') + 1); //fetch more items from server
        }
      });
    }
  }, 300));  
};

stopInfiniteScroll = function () {
  console.log('search and destroy!');
  $(window).off('scroll');
  _.each(this._infiniteScroll, function (obj) {
    obj.stop();
  });
};