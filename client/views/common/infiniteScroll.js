var scrolling = false,
    currentRoute; 

$(window).scroll(function() {
  scrolling = true; //run function when scroll
});

//handles infinite scrolling on events page
setInterval(function() {
  currentRoute = Router.current().route.name;
  if(scrolling && currentRoute === "home") {
    scrolling = false;

    //if we scrolled to 250px above bottom && have loaded enough topics to meet the limit
    if(TopicsModel.find().count === Session.get("topicsLimit") && $(window).scrollTop() + window.innerHeight >= $(document).height() - 250) {
      Session.set("topicsLimit", Session.get("topicsLimit") + 10); //fetch more topics from server
    }
  }
}, 300);