if (Meteor.users.find().count() === 0) {
  Accounts.createUser({
    email: 'test@example.com',
    password: 'asdf123',
    profile: {
      name: 'Test User',
      bio: 'Not much is known about him/her, except that not much is known about him/her.'
    }
  });
}
