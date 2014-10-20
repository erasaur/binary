Meteor.methods({
  validLink: function (inviterId, inviteCode) {
    return !!Invites.findOne({ 'inviterId': inviterId, 'inviteCode': inviteCode, 'accepted': false });
  },
  inviteUser: function (email) {
    var currentUser = Meteor.user();
    var inviterId = currentUser._id;

    // check that user can invite
    if (!canInvite(currentUser))
      throw new Meteor.Error('no-permission', 'This user does not have permission to continue.');

    // check that invited user doesn't exist
    if (Meteor.users.findOne({ 'emails': { $elemMatch: { 'address': email } } }))
      throw new Meteor.Error('duplicate-content', 'This content already exists.');

    // check that invited user hasn't been invited
    if (Invites.findOne({ 'invitedEmail': email }))
      throw new Meteor.Error('duplicate-content', 'This content already exists.');

    // calculate email hash
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

    var emailSubject = 'You are invited!';
    var emailProperties = {
      actionLink: getSiteUrl() + 'invite?inviter_id=' + invite.inviterId + '&invite_code=' + invite.inviteCode,
      inviter: getDisplayName(currentUser),
      inviterEmail: getEmail(currentUser)
    };

    console.log(inviteCode, emailProperties.actionLink);

    // send email
    Meteor.setTimeout(function () {
      buildAndSendEmail(email, emailSubject, 'emailInvite', emailProperties);
    }, 1);
  }
});