Meteor.methods({
  validLink: function (inviterId, inviteCode) {
    check(inviterId, String);
    check(inviteCode, String);

    return !!Invites.findOne({ 'inviterId': inviterId, 'inviteCode': inviteCode, 'accepted': false });
  },
  inviteUser: function (email) {
    check(email, String);

    var currentUser = Meteor.user();

    // check that user can invite
    if (!canInvite(currentUser))
      throw new Meteor.Error('no-permission', 'This user does not have permission to continue.');

    // check that invited user doesn't exist
    if (Meteor.users.findOne({ 'emails.address': email }))
      throw new Meteor.Error('duplicate-content', 'This content already exists.');

    // check that invited user hasn't been invited
    if (Invites.findOne({ 'invitedEmail': email }))
      throw new Meteor.Error('duplicate-content', 'This content already exists.');

    // calculate email hash
    var inviterId = currentUser._id;
    var inviteCode = Random.id();

    var invite = {
      inviterId: inviterId,
      invitedEmail: email,
      inviteCode: inviteCode,
      accepted: false
    };

    Invites.insert(invite);

    Meteor.users.update(invite.inviterId, {
      $inc: { 'invites.inviteCount': -1 },
      $addToSet: { 'invites.invitedEmails': email }
    });

    var emailSubject = i18n.t('email_invite_subject');
    var emailProperties = {
      action: {
        link: getSiteUrl() + 'invite?inviter_id=' + invite.inviterId + '&invite_code=' + invite.inviteCode,
        message: i18n.t('email_invite_action')
      },
      message: i18n.t('email_invite_message', {
        user: getDisplayName(currentUser),
        email: getEmail(currentUser)
      })
    };

    // send email
    Meteor.setTimeout(function () {
      buildAndSendEmail(email, emailSubject, 'emailNotification', emailProperties);
    }, 1);
  }
});
