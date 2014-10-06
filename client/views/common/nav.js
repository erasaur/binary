Template.nav.events({
	//prevent page from scrolling when mouse is in notifications box
	"DOMMouseScroll .notifications, mousewheel .notifications": function (event, template) {
		var target = event.currentTarget;
		var	$target = $(target);
		var	scrollTop = target.scrollTop;
		var	scrollHeight = target.scrollHeight;
		var	delta = event.originalEvent.wheelDelta;
		var	up = delta > 0;

		if (!up && -delta > scrollHeight - target.clientHeight - scrollTop) {
			$target.scrollTop(scrollHeight);
			event.stopPropagation();
			event.preventDefault();
			event.returnValue = false;
		} else if (up && delta > scrollTop) {
			$target.scrollTop(0);
			event.stopPropagation();
			event.preventDefault();
			event.returnValue = false;
		}
	},
	"click #js-logout": function(event, template) {
		Meteor.logout(function (error) {
			Router.go("home");
		});
	}
});













