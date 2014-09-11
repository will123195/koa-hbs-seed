var koa = require('koa');
var session = require('koa-session');
var logger = require('koa-logger');
var serve = require('koa-static');
var json = require('koa-json');
var mount = require('koa-mount');

var pages = require('./lib/koa-pages');
var config = require('./config/config.json');

var app = koa();

// canonical domain
app.use(function *(next) {
  if (this.request.header['x-forwarded-host'] === 'www.example.com') {
    return this.redirect('http://example.com' + this.request.url);
  }
  yield next;
});

// session
app.keys = [config.session.secretKey];
app.use(session());

// logging
app.use(logger());

// public static assets
app.use(serve('./public'));

// pretty json responses
app.use(json({ pretty: false, param: 'pretty' }));

// mount the pages
app.use(mount('/', pages({
  controllersDir: './controllers',
  publicDir: './public',
  index: 'default'
})));


// start listening for http requests
var port = process.env.PORT || config.port;
app.listen(port);
console.log([
  'Started: http://localhost:' + port + '/'
].join('\n'));
