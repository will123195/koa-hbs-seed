$(function() {

    // responsive formatting based on window width
    if ($(window).width() >= 1000) {
        $('body').addClass('r1000');
    } else if ($(window).width() >= 640) {
        $('body').addClass('r640');
    } else {
        $('body').addClass('r320');
    }

    // on window resize
    $(window).resize(function() {

        var w = $(this).width();
        if (w >= 1000) {
            $('body')
                .addClass('r1000')
                .removeClass('r640')
                .removeClass('r320');
        } else if (w >= 640) {
            $('body')
                .addClass('r640')
                .removeClass('r1000')
                .removeClass('r320');
        } else {
            $('body')
                .addClass('r320')
                .removeClass('r1000')
                .removeClass('r640');
        }
    });

});




(function($) {

    $.fn.render = function(name, data) {
        name = getTemplateName(name);
        this.html(Handlebars.templates[name](data));
        return this;
    };

    $.render = function(name, data) {
        name = getTemplateName(name);
        var html = Handlebars.templates[name](data);
        return html;
    };

    function getTemplateName(nickname) {
        var basename = nickname.split('/').reverse()[0];
        var names = [
            nickname,
            nickname + '/' + basename,
            'templates/' + nickname
        ];
        var match;
        names.forEach(function(name) {
            if (Handlebars.templates[name]) {
                match = name;
            }
        });
        if (match) {
            return match;
        }
        throw new Error('$.render: Invalid template name.');
    }

}(jQuery));







//
// when helper
//
// modified from http://stackoverflow.com/a/21915381/1162513
var that = this;

Handlebars.registerHelper("when", function (expression, options) {
  return Handlebars.helpers["x"].apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper("x", function (expression, options) {
  var fn = function(){}, result;

  // in a try block in case the expression have invalid javascript
  try {
    // create a new function using Function.apply, notice the capital F in Function
    fn = Function.apply(
      this,
      [
        'return ' + expression + ';' // edit that if you know what you're doing
      ]
    );
  } catch (e) {
    console.warn('[warning] {{x ' + expression + '}} is invalid javascript', e);
  }

  // then let's execute this new function, and pass it window, like we promised
  // so you can actually use window in your expression
  // i.e expression ==> 'window.config.userLimit + 10 - 5 + 2 - user.count' //
  // or whatever
  try {
    // if you have created the function with more params that need the scope
    result = fn.bind(this)(that);
  } catch (e) {
    console.warn('[warning] {{x ' + expression + '}} runtime error', e);
  }
  // return the output of that result, or undefined if some error occured
  return result;
});





//
// Debug helper
//
Handlebars.registerHelper('dump', function (data) {
  return new Handlebars.SafeString(
    JSON.stringify(data, null, '\t')
  );
});
