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
    console.log(count);
    var target = document.body.offsetHeight - 300;

    if (window.innerHeight + window.scrollY >= target) {
      if (count === Session.get('topicsLimit')) {
        Session.set('topicsLimit', Session.get('topicsLimit') + 15); //fetch more topics from server
      }
    }
  }, 300));  

  return handle;
};
