Template.signup.events({
	"change input": function(event, template) {
		fadeElement($(".landing-form-errors"));	
	},
	"submit #signup-form": function(event, template) {
		event.preventDefault();
		var username = template.find("#create-username").value;
		var	email = template.find("#create-email").value;
		var	password = template.find("#create-password").value;

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