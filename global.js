TopicsModel = new Meteor.Collection("topics");
CommentsModel = new Meteor.Collection("comments");
NotificationsModel = new Meteor.Collection("notifications");

TopicsModel.initEasySearch("title", {
	"limit": 20,
	"use": "mongo-db"
});

Meteor.users.initEasySearch("username", {
	"limit": 20,
	"use": "mongo-db"
});

// EasySearch.createSearchIndex("topics", {
// 	"collection": TopicsModel, 
// 	"field": "title",
// 	"limit": 20
// });

// EasySearch.createSearchIndex("users", {
// 	"collection": Meteor.users,
// 	"field": "username",
// 	"limit": 20
// });