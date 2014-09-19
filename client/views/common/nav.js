Template.nav.indexes = ["topics", "users"];
Template.navItems.helpers({
	hasNotifications: function() {
		if(Meteor.user() && Meteor.user().notifications)
			return Meteor.user().notifications.commentReply.length || Meteor.user().notifications.followingUser.length || Meteor.user().notifications.followingTopic.length;
	},
	notifications: function() {
		if(Meteor.user() && Meteor.user().notifications) {
			var result = [],
					notif = Meteor.user().notifications;

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
	"DOMMouseScroll .notifications, mousewheel .notifications": function(event, template) {
		var target = event.currentTarget,
				$target = $(target),
				scrollTop = target.scrollTop,
				scrollHeight = target.scrollHeight,
				delta = event.originalEvent.wheelDelta,
				up = delta > 0;

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
	},
	"submit #search-form": function(event, template) {
		event.preventDefault();
	},
	"click .search-link": function(event, template) {
		$("#search-modal").modal("hide");
	}
});