Template.navItems.helpers({
	hasNotifications: function() {
		if(Meteor.user() && Meteor.user().notifications)
			return Meteor.user().notifications.commentReply.length || 
						 Meteor.user().notifications.followingUser.length || 
						 Meteor.user().notifications.followingTopic.length;
	},
	notifications: function() {
		if(Meteor.user() && Meteor.user().notifications) {
			var result = [];
			var	notif = Meteor.user().notifications;

			result = notif.commentReply.concat(notif.followingUser);

			_.each(notif.followingTopic, function(obj) {
				if(obj.count) { //if the "count" attribute exists, we concatenate count to message: "55" + " users posted in topic"
					result.push({"url": obj.url, "message": obj.count + obj.message, "read": false});
				} else {
					result.push(obj); //otherwise, just add the array as is	
				}
			});

			return result;
		}
	}
});

Template.nav.events({
	//prevent page from scrolling when mouse is in notifications box
	"DOMMouseScroll .notifications, mousewheel .notifications": function(event, template) {
		var target = event.currentTarget;
		var	$target = $(target);
		var	scrollTop = target.scrollTop;
		var	scrollHeight = target.scrollHeight;
		var	delta = event.originalEvent.wheelDelta;
		var	up = delta > 0;

		if(!up && -delta > scrollHeight - target.clientHeight - scrollTop) {
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
	"click #logout": function(event, template) {
		Meteor.logout(function(error) {
			Router.go("home");
		});
	}
});













