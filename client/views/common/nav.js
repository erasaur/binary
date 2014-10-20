Template.nav.rendered = function () {
	$('.invite').popover({ html: true });
	$('.dropdown-menu input').click(function (e) {
    e.stopPropagation();
  });
};
Template.nav.events({
	//prevent page from scrolling when mouse is in notifications box
	'DOMMouseScroll .notifications, mousewheel .notifications': function (event, template) {
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
	'click #js-logout': function (event, template) {
		Meteor.logout(function (error) {
			Router.go('home');
		});
	},
	'click #js-invite': function (event, template) {
		var email = template.find('#js-invite-email').value;
		
		Meteor.call('inviteUser', email, function (error) {
			if (error) {
				if (error.error === 'no-permission')
					alert('Oh no, it looks like you are out of invites!');
				else if (error.error === 'duplicate-content')
					alert('Your friend has already been invited.');
				else
					alert('Sorry, something went wrong. Please try again in a moment.');
			}
			else 
				alert('Your invite was sent successfully!');
		});
	}
});













