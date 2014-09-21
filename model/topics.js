TopicsModel = new Mongo.Collection("topics");

TopicsModel.initEasySearch("title", {
	"limit": 20,
	"use": "mongo-db"
});