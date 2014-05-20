function formatField(variable, value) {
	var temp = {};
	temp[variable] = value;
	return temp;
}

Discuss.Topics = {
	vote: function(id, user, side) {
		var first, second, opposite;

		if(side == "pro") {
			first = "proUsers";
			second = "conUsers";
			opposite = "con";
		} else {
			first = "conUsers";
			second = "proUsers";
			opposite = "pro";
		}

		//assume we clicked on pro
		var t = TopicsModel.findOne({"_id": id});
		if(t[second].indexOf(user) == -1) { //didn't vote con already
			if(t[first].indexOf(user) != -1) { //voted pro already, so unvote
				TopicsModel.update({"_id": id}, {$inc: formatField(side, -1)});
				TopicsModel.update({"_id": id}, {$pull: formatField(first, user)});
			} else { //didn't vote at all yet, so vote
				TopicsModel.update({"_id": id}, {$inc: formatField(side, 1)});
				TopicsModel.update({"_id": id}, {$push: formatField(first, user)});
			}
		} else { //voted con already, so switch
			TopicsModel.update({"_id": id}, {$inc: formatField(opposite, -1)});
			TopicsModel.update({"_id": id}, {$pull: formatField(second, user)});
			TopicsModel.update({"_id": id}, {$inc: formatField(side, 1)});
			TopicsModel.update({"_id": id}, {$push: formatField(first, user)});
		}
	}
}