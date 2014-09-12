var cIndex = 0; //color index -- global var

function removeSessionReplies(rows) { 
	var ids = [];

	rows.each(function() {
		var current = this.id;
		if(current) { //if this particular element has a class
			var temp = current.indexOf("-");
			if(temp > -1) { //see if it has a "-" in the class. if so, it means it has id-replies-x
				var currentID = current.substring(0, temp); //get the id

				if(ids.indexOf(currentID) < 0) { //if we haven't already seen this id, add it
					ids.push(currentID);
				}
			}
		}
	});

	var arr = Session.get("showingReplies");
	arr = _.extend([], arr);

	//remove all the ids that are contained in the set of ids we are removing
	arr = _.reject(arr, function(num) { return _.contains(ids, num); });
	Session.set("showingReplies", arr);	

	rows.remove();
}

//for use with infinite scrolling
var	scrolling = false,
		currentRoute; 

$(window).scroll(function() {
	scrolling = true; //run function when scroll
});

//handles infinite scrolling on events page
setInterval(function() {
	currentRoute = Router.current().route.name;
	if(scrolling && currentRoute === "home") {
		scrolling = false;

		//if we scrolled to 250px above bottom && have loaded enough topics to meet the limit
		if(TopicsModel.find().count === Session.get("topicsLimit") && $(window).scrollTop() + window.innerHeight >= $(document).height() - 250) {
			Session.set("topicsLimit", Session.get("topicsLimit") + 10); //fetch more topics from server
		}
	}
}, 300);

Template.home.events({
	"click #create-topic": function(event, template) {
		$("html,body").animate({ scrollTop: 0}, "fast");
	},
	"submit #create-topic-form": function(event, template) {
		event.preventDefault();
		var title = template.find("#create-title").value;

		Meteor.call("newTopic", title, Meteor.userId(), Meteor.user().username, function(error, result) {
			if(error) {
				alert(formatError(error));
			} else {
				$("#create-title").val("");
			}
		});
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

Template.topic.events({
	"click .inc-pro": function(event, template) {
		if(Session.get("currentTopic") && Meteor.user()) {
			Discuss.Topics.vote(Session.get("currentTopic"), Meteor.userId(), "pro");
		}
	},
	"click .inc-con": function(event, template) {
		if(Session.get("currentTopic") && Meteor.user()) {
			Discuss.Topics.vote(Session.get("currentTopic"), Meteor.userId(), "con");
		}
	},
	"click #follow": function(event, template) {
		Meteor.call("followTopic", Meteor.userId(), this.topic._id);
	},
	"click #unfollow": function(event, template) {
		Meteor.call("unfollowTopic", Meteor.userId(), this.topic._id);
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
			var arr = Session.get("showingReplies");
			arr = _.extend([], arr);
			arr.push(id.toString());
			Session.set("showingReplies", arr);

			if(!parent.attr("class")) { //if parent is not a reply comment-row
				//get siblings' (the ones with empty or no class, ie the ones that are not replies) ids
				var siblings = parent.siblings("tr[class=''], tr:not([class])").children("td").children("div.comment"),
						ids = [];

				siblings.each(function() {
					ids.push($(this).attr("id"));
				});

				var showing = Session.get("showingReplies");
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
				UI.insert(UI.renderWithData(Template.replies, {id: id, side: side, color: cIndex}), parent.parent()[0], parent.next()[0]);
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

Template.nav.events({
	"DOMMouseScroll .notifications, mousewheel .notifications": function(event, template) {
		var target = event.currentTarget,
				$target = $(target),
				scrollTop = target.scrollTop,
				scrollHeight = target.scrollHeight,
				delta = event.originalEvent.wheelDelta,
				up = delta > 0;

		if(!up && -delta > scrollHeight - target.clientHeight - scrollTop) {
			$target.scrollTop(scrollHeight);
			event.stopPropagation();
			event.preventDefault();
			event.returnValue = false;
		} else if (up && delta > scrollTop) {
			$target.scrollTop(0);
			event.stopPropagation();
			event.preventDefault();
			event.returnValue = false;
		}
	},
	"click #logout": function(event, template) {
		Meteor.logout(function(error) {
			Router.go("home");
		});
	},
	"submit #search-form": function(event, template) {
		event.preventDefault();
	},
	"click .search-link": function(event, template) {
		$("#search-modal").modal("hide");
	}
});

function fadeElement(elem) {
	if(elem.css("opacity") > 0) {
		elem.fadeOut("slow", function() {
			elem.html("");
		});
	}
}

Template.signup.events({
	"change input": function(event, template) {
		fadeElement($(".landing-form-errors"));	
	},
	"submit #signup-form": function(event, template) {
		event.preventDefault();
		var username = template.find("#create-username").value,
				email = template.find("#create-email").value,
				password = template.find("#create-password").value;

		Meteor.call("newUser", username, email, password, function(error, result) {
			if(error) {
				template.find(".landing-form-errors").innerHTML = "<li>" + formatError(error) + "</li>";
				$(".landing-form-errors").fadeTo("slow", 1);
			} else {
				alert(result);

				Meteor.loginWithPassword(username, password, function(error) {
					if(error) {
						alert(formatError(error));
					} else {
						Router.go("home");
					}
				});
			}
		});
	}
});

Template.login.events({
	"change input": function(event, template) {
		fadeElement($(".landing-form-errors"));
	},
	"submit #login-form": function(event, template) {
		event.preventDefault();
		var username = template.find("#username").value,
				password = template.find("#password").value;

		Meteor.loginWithPassword(username, password, function(error) {
			if(error) { 
				template.find(".landing-form-errors").innerHTML = "<li>" + formatError(error) + "</li>";
				$(".landing-form-errors").fadeTo("slow", 1);
			}
		});
	}
});

Template.profile.events({
	"click .navbar-tab": function(event, template) {
		Session.set("currentTab", event.target.id);
	},
	"click #follow": function(event, template) {
		Meteor.call("newFollower", Meteor.userId(), this.user._id);
	},
	"click #unfollow": function(event, template) {
		Meteor.call("removeFollower", Meteor.userId(), this.user._id);
	}
});













