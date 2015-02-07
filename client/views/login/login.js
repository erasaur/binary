Template.login.events({
	'input input': function (event, template) {
		fadeElement(template.$('.landing-form-errors'));
	},
	'submit #js-login-form': function (event, template) {
		event.preventDefault();
		var email = template.find('#js-email').value;
		var	password = template.find('#js-password').value;
		var $errors = template.$('.landing-form-errors');

		function showError (message) {
			$errors
				.html('<li>' + message + '</li>')
				.velocity('fadeIn', { duration: 1000 });
		}

		if (!email || !password) {
			showError(i18n.t('missing_fields'));
			return;
		}

		Meteor.loginWithPassword(email, password, function (error) {
			if (error) {
				showError(i18n.t('error'));
			}
		});
	}
});
