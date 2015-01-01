Template.landing.rendered = function () {
  var questions = [
    'Should police be required to wear body cameras?',
    'Should Sony have pulled The Interview from theaters?',
    'Will the Seahawks win Super Bowl 2015?',
    'Rails or Django?',
    'Let\'s settle it: vim or emacs?',
    'Umbrella revolution: good or bad for Hong Kong?',
    'Are investors betting too much on messaging apps?',
    'Should same-sex marriage be legal?',
    'Does God exist?'
  ];
  var questionIndex = 0;

  $('body').css('height', '100%');
  var $text = this.$('#landing-image-header');
  var $pro = this.$('#landing-image-pro');
  var $con = this.$('#landing-image-con');

  // fade content in
  this.$('.landing-container').css('opacity', 0).velocity('fadeIn', { duration: 400 });
  this.$('.landing-image').css('opacity', 0).velocity('fadeIn', { duration: 400 });

  // animate text
  function animateText () {
    $text.velocity('fadeOut', { duration: 500, complete: function () {
      $(this).text(questions[questionIndex]);
      $(this).velocity('fadeIn', { duration: 500 });
      questionIndex = questionIndex >= questions.length - 1 ? 0 : questionIndex + 1;

      function rn () {
        return parseInt(Math.random()*899, 10) + 100;
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

  animateText();
  this._animateHandle = setInterval(animateText, 6000);
};

Template.landing.destroyed = function () {
  $('body').css('height', '');
  clearInterval(this._animateHandle);
};
