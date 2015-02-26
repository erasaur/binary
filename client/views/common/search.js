var searching = new ReactiveVar(false);
var searchTemplate = {
  'topics': 'topicItem',
  'users': 'profileItem'
};

var stopSearching = function () {
  $('.search-input').val('').blur();
  searching.set(false);
};
var isSearching = function () {
  return searching.get();
};

Template.searchInput.helpers({
  indexes: ['topics', 'users'],
  searching: isSearching,
  placeholder: function () {
    return i18n.t('search_prompt');
  },
  topicModal: function () {
    return Meteor.userId() ? '#new-topic-modal' : '#signup-modal';
  }
});

Template.mainLayout.helpers({
  searching: isSearching
});

Template.pageLayout.helpers({
  searching: isSearching
});

Template.nav.events({
  'click .navbar-brand, click .dropdown-menu a[href]': function (event, template) {
    stopSearching();
  }
});

Template.searchInput.events({
  'input .search-input': _.debounce(function (event, template) {
    if (event.target.value == '') {
      searching.set(false);
    } else {
      searching.set(true);
    }
  }, 200),
  'click #js-search-cancel': function (event, template) {
    stopSearching();
  },
  'submit #js-search-form': function (event, template) {
    event.preventDefault();
  }
});

Template.searchResults.events({
  'click a[href]': function (event, template) {
    stopSearching();
  }
});
