Template.login.events({
	"change input": function(event, template) {
		fadeElement($(".landing-form-errors"));
	},
	"submit #js-login-form": function(event, template) {
		event.preventDefault();
		var username = template.find("#js-username").value;
		var	password = template.find("#js-password").value;

		Meteor.loginWithPassword(username, password, function(error) {
			if(error) { 
				template.find(".landing-form-errors").innerHTML = "<li>" + formatError(error) + "</li>";
				$(".landing-form-errors").fadeTo("slow", 1);
			}
		});
	}
});