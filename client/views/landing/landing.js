Template.landing.rendered = function () {
  var questions = ['kjhkjhkjhkjhkjhkjhkjhkjh kjhkjhkjhkjhkjhkjhkjhkjh', 'asdfasdfasdfasdfsdf asdf asdf', 'zcxzxczxczxczxczxczxczx'];
  var questionIndex = 0;

  var $text = this.$('#landing-image-header');
  var $pro = this.$('#landing-image-pro');
  var $con = this.$('#landing-image-con');

  function animate () {
    $text.velocity('fadeOut', { duration: 500, complete: function () {
      $(this).text(questions[questionIndex]);
      $(this).velocity('fadeIn', { duration: 500 });
      questionIndex = questionIndex >= questions.length - 1 ? 0 : questionIndex + 1;

      function rn () {
        return parseInt(Math.random()*899) + 100;
      }

      $({ pro: 100, con: 100 }).delay(250).animate({ pro: rn(), con: rn() }, {
        duration: 1200,
        step: _.throttle(function () {
          $pro.text(Math.ceil(this.pro));
          $con.text(Math.ceil(this.con));
        }, 100)
      });
    }});
  };

  animate();
  this._animateHandle = Meteor.setInterval(animate, 6000);
};

Template.landing.destroyed = function () {
  Meteor.clearInterval(this._animateHandle);
};