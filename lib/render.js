
var _ = require('lodash');
var views = require('co-views');
var co = require('co');
var fs = require('co-fs');
var Handlebars = require('handlebars');
var exec = require('co-exec');
var mkdirp = require('mkdirp');

// precompile all handlebars templates on startup and register them as partials
co(function *() {

  mkdirp.sync('./public/cache/handlebars');

  var precompiledTemplatesFile = './public/cache/handlebars/precompiled.js';
  var partialsFile = './public/cache/handlebars/precompiled-module.js';
  var partialsModule = '../public/cache/handlebars/precompiled-module.js';

  yield exec('handlebars ./public -e html -f ' + precompiledTemplatesFile);

  // register templates as partials
  var partials = yield fs.readFile(precompiledTemplatesFile, 'utf8');
  partials = partials.split('\n');
  partials.shift();
  partials.unshift("var Handlebars = require('handlebars');");
  partials.pop();
  partials.push("module.exports = templates;");
  partials = partials.join('\n');
  yield fs.writeFile(partialsFile, partials);
  var templates = require(partialsModule);
  Object.keys(templates).forEach(function(name) {
    Handlebars.registerPartial(name, templates[name]);
  });

})();





module.exports = function *(view, data) {

  //console.log('render.js data', data);
  //console.log('Handlebars:', Handlebars);

  // setup views mapping .html
  // to the swig template engine

  var render = views(__dirname + '/../public/', {
    map: { html: 'handlebars' }
  });



  // data.layoutController = require('../layouts/' + data.layout + '.js');
  // data.layoutController();


  //console.log('view:', view);

  // first render the content of the page
  data.content = yield render(view, data);

  var html;
  if (data.layout) {
    // now render the layout with the rendered content embedded
    html = yield render('layouts/' + data.layout + '/' + data.layout, data);
  } else {
    html = data.content;
  }

  return html;

};



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


