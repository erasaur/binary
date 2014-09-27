Topics = new Mongo.Collection("topics");

Topics.initEasySearch("title", {
	"limit": 20,
	"use": "mongo-db"
});