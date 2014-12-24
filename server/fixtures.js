if (Meteor.users.find().count() === 0) {
  Accounts.createUser({
    email: 'test@example.com',
    password: 'asdf123',
    profile: {
      name: 'Test User',
      bio: i18n.t('default_profile')
    }
  });
}
