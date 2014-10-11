Template.login.events({
	'change input': function(event, template) {
		fadeElement($('.landing-form-errors'));
	},
	'submit #js-login-form': function(event, template) {
		event.preventDefault();
		var email = template.find('#js-email').value;
		var	password = template.find('#js-password').value;

		Meteor.loginWithPassword(email, password, function(error) {
			if(error) { 
				template.find('.landing-form-errors').innerHTML = '<li>' + formatError(error) + '</li>';
				$('.landing-form-errors').fadeTo('slow', 1);
			}
		});
	}
});