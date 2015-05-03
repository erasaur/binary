Template.invite.events({
	'submit #js-signup-form': function (event, template) {
		event.preventDefault();
		var	name = template.find('#js-create-name').value;
		var	password = template.find('#js-create-password').value;
		var query = getCurrentQuery();
		var inviteCode = query && query.invite_code;

		Meteor.call('newInvitedUser', name, password, inviteCode, function (error, result) {
			if (error) {
				var niceError = i18n.t('error');

				if (error.error === 'invalid-invite') {
					niceError = i18n.t('invalid_invitation_link');
				}
				else if (error.error === 'invalid-content') {
					niceError = i18n.t('use_alphanumeric_name');
				}
				else if (error.error === 'weak-password') {
					niceError = i18n.t('password_too_short');
				}

				toastr.warning(niceError);
			}
			else {
				var email = result;
				Meteor.loginWithPassword(email, password, function (error) {
					if (error)
						toastr.warning(i18n.t('error'));
					else
						Router.go('home');
				});
			}
		});
	}
});

Template.inviteModal.events({
	'submit #js-invite-form': function (event, template) {
		event.preventDefault();
		event.stopPropagation();

		var $email = template.$('#js-invite-email');
    var email = $email.val();

    if (!email) {
      toastr.warning(i18n.t('missing_fields'));
      return;
    }

		Meteor.call('inviteUser', email, function (error) {
			if (error) {
				if (error.error === 'no-permission')
					toastr.warning(i18n.t('no_more_invites'));
				else if (error.error === 'duplicate-content')
					toastr.warning(i18n.t('already_invited'));
				else
					toastr.warning(i18n.t('error'));
			} else {
				toastr.success(i18n.t('invite_success'));
				$email.val('');
			}
		});
	}
});
