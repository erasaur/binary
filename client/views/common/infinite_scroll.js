initInfiniteScroll = function (collection) {
  var items = window[capitalize(collection)].find();
  var count = 0;

  // observeChanges will fire for initial set, so count can start at 0
  var handle = items.observeChanges({
    added: function () {
      count++;
    },
    removed: function () {
      count--;
    }
  });

  $(window).on('scroll', _.throttle(function () {
    // trigger at 300px above bottom
    var target = document.body.offsetHeight - 300;

    if (window.innerHeight + window.scrollY >= target) {
      console.log(count, Session.get('itemsLimit'))
      if (count >= Session.get('itemsLimit')) {
        Session.set('itemsLimit', Session.get('itemsLimit') + 15); //fetch more topics from server
      }
    }
  }, 300));  

  return handle;
};
