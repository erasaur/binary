Template.loginForm.events({
	'submit #js-login-form': function (event, template) {
		event.preventDefault();
		var email = template.find('#js-email').value;
		var	password = template.find('#js-password').value;

		if (!email || !password) {
			toastr.warning(i18n.t('missing_fields'));
			return;
		}

		Meteor.loginWithPassword(email, password, function (error) {
			if (error) {
				toastr.warning(i18n.t('login_error'));
			}
		});
	}
});
