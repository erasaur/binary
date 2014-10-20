Template.invite.helpers({
	validLink: function () {
		return Meteor.call('validLink', Router.current().params.invite_code);
	}
});
Template.invite.events({
	'input input': function (event, template) {
		fadeElement($('.landing-form-errors'));	
	},
	'submit #js-signup-form': function (event, template) {
		event.preventDefault();
		var	name = template.find('#js-create-name').value;
		var	password = template.find('#js-create-password').value;
		var inviteCode = Router.current().params.invite_code;

		Meteor.call('newUser', name, password, inviteCode, function (error, result) {
			if (error) {
				var niceError = error.reason || 'Sorry, something went wrong. Please try again in a moment.';

				if (error.error === 'invalid-invite') {
					niceError = 'Sorry, the invitation link provided is broken!';
				}
				else if (error.error === 'invalid-content') {
					niceError = 'Please use alphanumeric characters (minimum 3, maximum 25) to keep names identifiable. Thank you!';
				}
				else if (error.error === 'weak-password') {
					niceError = 'Your password should have 6 characters at minimum. We don\'t want your account to be compromised!';
				}

				template.find('.landing-form-errors').innerHTML = '<li>' + niceError + '</li>';
				$('.landing-form-errors').fadeTo('slow', 1);
			} 
			else {
				Meteor.loginWithPassword(email, password, function (error) {
					if (error) {
						alert('Oops, something went wrong when you were logging in. Please try again in a moment. Thank you!');
					} else {
						Router.go('home');
					}
				});
			}
		});
	}
});