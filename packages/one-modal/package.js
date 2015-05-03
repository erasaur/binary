Package.describe({
  name: 'one-modal',
  version: '0.0.1',
  summary: 'One Modal Package'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use([
    'templating',
    'twbs:bootstrap@3.3.4'
  ], 'client');

  api.addFiles('lib/client/one_modal.html');
  api.addFiles('lib/client/one_modal.js');

  api.export('OneModal', 'client');
});

