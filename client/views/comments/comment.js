var cIndex = 0; //color index

function removeSessionReplies(rows) { 
	var ids = [];

	rows.each(function() {
		var current = this.id;
		if(current) { //if this particular element has an id
			var temp = current.indexOf("-");
			if(temp > -1) { //see if it has a "-" in the id. if so, it means it has id-replies-x
				var currentID = current.substring(0, temp); //get the id

				if(ids.indexOf(currentID) < 0) { //if we haven't already seen this id, add it
					ids.push(currentID);
				}
			}
		}
	});

	var arr = SessionAmplify.get("showingReplies");
	arr = _.extend([], arr);

	//remove all the ids that are contained in the set of ids we are removing
	arr = _.reject(arr, function(num) { return _.contains(ids, num); });
	SessionAmplify.set("showingReplies", arr);	

	Blaze.remove(Blaze.getView(rows.get(0)));
	rows.remove();
}

Template.comment.helpers({
	hasReplies: function() {
		return CommentsModel.findOne({"topic": this.topic}).replies.length;
	},
	showingReplies: function() {
		return SessionAmplify.get("showingReplies").indexOf(this._id) > -1;
	},
	readMore: function() {
		return this.content.split("\n").length > 5 || this.content.length > 200;
	},
	liked: function() {
		return Meteor.user().activity.liked && Meteor.user().activity.liked.indexOf(this._id) > -1;
	}
});

Template.newComment.events({
	"click .post-comment": function(event, template) {
		if(Session.get("currentTopic")) {
			var siblings = $(event.target).siblings(),
					input = $(siblings[0]),
					comment = input.val(),
					side = $(siblings[1]).hasClass("btn-success") ? "pro":"con",
					replyTo = this.id || "",
					replyToUser = (replyTo == "") ? "":CommentsModel.findOne({"_id": replyTo}).owner;

			Meteor.call("newComment", Meteor.userId(), Meteor.user().username, Session.get("currentTopic"), comment, side, replyTo, replyToUser, function(error, result) {
				if(error) {
					alert(formatError(error));
				} else {
					scrollToId(result);
				}
			});

			input.val("");
		}
	},
	"click .post-side": function(event, template) {
		var t = $(event.target);
		t.toggleClass("btn-success");
		t.toggleClass("btn-danger");
	}
});

Template.comment.events({
	"click .comment-content": function(event, template) {
		$(event.target).toggleClass("collapsed");
	},
	"click .comment-replyto": function(event, template) {
		event.preventDefault();
		if(this.replyTo) {
			scrollToId(this.replyTo);
		}
	},
	"click .toggle-replies": function(event, template) {
		var id = this._id,
				parent = $(event.target).closest("tr"), //gets the clicked comment's tr (ie tr before the replies)
				top = parent.next(), //top border of next tr
				replies = top.next(), 
				nclass = top.attr("class"),
				rclass = replies.attr("class"); //replies' class

		if (replies.length && replies.hasClass(id + "-replies")) { //if we're closing replies
			//get everything within the borders of this reply box (including any nested replies)
			var temp = top.nextUntil("#" + id + "-replies-bot");

			//check for a potential border of the upper/surrounding level of replies
			var bot = temp.last().next(),
					pot = bot.next().next(); //temp.last().next() is the bot border. next().next() is replies bottom. next().next().next() is (potentially) a collapsed border
			if (pot.attr("class") && pot.attr("class").indexOf("collapse") > -1) {
				pot.removeClass("collapse"); //since we're removing this reply box and its borders, we need to un-collapse the previous border
			}

			temp = temp.add(top).add(bot); //add self as well as the true last item (the bottom border). nextUntil goes up to but excluding last, so we have to call next() again

			//remove temp, and remove from list of showing replies, so the replies can be shown in original positions (when not shown as replies)
			removeSessionReplies(temp);
		} else { //we're adding replies
			if(rclass) { //if row after next has a class
				if(nclass && nclass.indexOf("border") > -1 && rclass.indexOf("replies ") > -1) { //next row element is a top border (aka switching sides)
					var theID = top.attr("id");
					theID = "#" + theID.substring(0, theID.length - 3) + "bot"; //id-replies-top -> id-replies-bot

					var rows = top.nextUntil(theID).andSelf().add(theID);

					//remove rows, and remove from list of showing replies, so the replies can be shown in original positions (when not shown as replies)
					removeSessionReplies(rows); 
				} 
				else if(rclass.indexOf("border") > -1) { //its a bottom border... we need to collapse it
					replies.addClass("collapse"); //set height = 0, since we'll be adding another set of replies (which has its own top border)
				}
			}

			//add id to list of comments that are showing replies, so we can remove replies from original position and show in the replies box instead (prevent duplicates showing)
			var arr = SessionAmplify.get("showingReplies");
			arr = _.extend([], arr);
			arr.push(id.toString());
			SessionAmplify.set("showingReplies", arr);

			if(!parent.attr("class")) { //if parent is not a reply comment-row
				//get siblings' (the ones with empty or no class, ie the ones that are not replies) ids
				var siblings = parent.siblings("tr[class=''], tr:not([class])").children("td").children("div.comment"),
						ids = [];

				siblings.each(function() {
					ids.push($(this).attr("id"));
				});

				var showing = SessionAmplify.get("showingReplies");
				//if siblings ids are contained within ids that are showing replies, then close that sibling's replies
				ids = _.filter(ids, function(num) { return showing.indexOf(num) > -1; });

				_.each(ids, function(id) {
					top = $("#" + id + "-replies-top");
					var	temp = top.nextUntil("#" + id + "-replies-bot"),
							bot = temp.last().next(),
							pot = bot.next();

					if (pot.attr("class") && pot.attr("class").indexOf("collapse") > -1) {
						pot.removeClass("collapse"); //since we're removing this reply box and its borders, we need to un-collapse the previous border
					}

					temp = temp.add(top).add(bot); //add self as well as the true last item (the bottom border). nextUntil goes up to but excluding last, so we have to call next() again
					//remove temp, and remove from list of showing replies, so the replies can be shown in original positions (when not shown as replies)
					removeSessionReplies(temp);
				});
			}

			cIndex = (cIndex >= 4) ? 0 : cIndex + 1;
			var side = this.side; //have to do this because Meteor.render changes the context or something

			//add to the parent of parent's dom element, before the next dom element
			if(!$("#" + id + "-replies-top").length) {
				Blaze.renderWithData(Template.replies, {id: id, side: side, color: cIndex}, parent.parent()[0], parent.next()[0]);
			}
		}
	},
	"click .like-comment": function(event, template) {
		Meteor.call("likeComment", Meteor.userId(), this._id, this.owner);
	},
	"click .unlike-comment": function(event, template) {
		Meteor.call("unlikeComment", Meteor.userId(), this._id, this.owner);
	}
});