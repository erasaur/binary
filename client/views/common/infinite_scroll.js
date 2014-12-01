initInfiniteScroll = function (collection, options) {
  var options = options || {};
  var items = window[capitalize(collection)].find(options);
  var count = 0;

  // observeChanges will fire for initial set, so count can start at 0
  this._infiniteScroll = items.observeChanges({
    added: function () {
      count++;
    },
    removed: function () {
      count--;
    }
  });

  console.log('items limit reset');
  Session.set('itemsLimit', 2);

  $(window).on('scroll', _.throttle(function () {
    // trigger at 300px above bottom
    var target = document.body.offsetHeight - 300;

    if (window.innerHeight + window.scrollY >= target) {
      console.log(count, Session.get('itemsLimit'))

      if (count >= Session.get('itemsLimit')) {
        Session.set('itemsLimit', Session.get('itemsLimit') + 2); //fetch more items from server
      }
    }
  }, 300));  
};

stopInfiniteScroll = function () {
  console.log('search and destroy!');
  $(window).off('scroll');
  this._infiniteScroll && this._infiniteScroll.stop();
};