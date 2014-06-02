TopicsModel = new Meteor.Collection("topics");
CommentsModel = new Meteor.Collection("comments");
NotificationsModel = new Meteor.Collection("notifications");

EasySearch.createSearchIndex("topics", {
	"collection": TopicsModel, //maybe merge topics + users here? then in the results, section them off based on attribute [perhaps in the each]
	"field": "title",
	"limit": 20,
	"use": "mongo-db"
});