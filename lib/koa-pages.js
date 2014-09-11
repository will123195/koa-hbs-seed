var koa = require('koa');
var render = require('./render');
var _ = require('lodash');
var route = require('koa-route');
var path = require('path');
var bodyParser = require('koa-bodyparser');
var callerPath = require('caller-path');
var walk = require('co-walk');
var co = require('co');
var paramify = require('paramify');
var qs = require('qs');
var fs = require('fs');
var less = require('less');
var md5 = require('MD5');
var mkdirp = require('mkdirp');

var app = koa();
app.use(bodyParser());


module.exports = function(opts) {

  opts.index = opts.index || 'index';
  if (!opts.controllersDir) {
    throw new Error('controllersDir is required.');
  }
  var caller = callerPath();
  var callerDir = caller.substring(0, caller.lastIndexOf(path.sep));
  var pagesDir = path.join(callerDir, opts.controllersDir);
  var publicDir = path.join(callerDir, opts.publicDir);

  co(function *() {

    files = yield walk(pagesDir);
    files.push(opts.index + '.js');
    files.reverse();
    files.forEach(function(file) {

      file = file.substring(0, file.lastIndexOf('.js'));
      var parts = parseView(file);

      app.use(route.get(parts.uri, function *() {

        // reset the parts each time this route is triggered
        // because the view may have been modified previously
        parts = parseView(file);

        var page = {
          js: [],
          css: [],
          less: []
        };
        page.view = _.clone(file); //path.join(parts.path, parts.name);
        page.set = function (obj) {
          _.merge(this, obj);
        };
        page.ctx = this;
        page.session = this.session;
        page.params = arguments;

        page.accessDenied = function() {
          if (this.session.user) {
            this.view = '401';
            this.ctx.status = 401;
            this.layout = 'html5';
          } else {
            this.showLogin();
          }
        };

        page.pageNotFound = function() {
          this.view = '404';
          this.ctx.status = 404;
        };

        page.showLogin = function() {
          this.view = 'login';
          this.title = 'Sign In';
          // this.js = ['/views/login/login.js'];
          // this.css = ['/views/login/login.css'];
          this.layout = 'html5';
          this.loggingIn = true;
        };

        page.redirect = function(uri) {
          this.ctx.redirect(uri);
          this.redirecting = true;
        };


        var pagePath = path.join(pagesDir, parts.path, parts.name);
        var controller = require(pagePath);
        if (typeof controller === 'function') {
          page.controller = controller;
        }
        // else {

        //   page.controller = controller.page;
        //   if (controller.access) {
        //     if (!this.session.user) {
        //       page.showLogin();
        //     }
        //     // TODO check if the logged in user has the specified
        //     // access level
        //   }
        // }


        parts = parseView(page.view);


        if (!page.loggingIn) {
          // begin parse params
          var split = this.req.url.indexOf('?');
          var uri = '';
          page.params = {};
          if (split === -1) {
            uri = this.req.url;
          } else {
            uri = this.req.url.substring(0, split);
            var querystring = this.req.url.substring(split + 1);
            page.params = qs.parse(querystring);
          }
          var parse = paramify(uri);
          parse(parts.uri);
          // paramify's return object is a weird array object, convert it to regular object
          var params = {};
          Object.keys(parse.params).forEach(function(key) {
            params[key] = parse.params[key];
          });
          page.params = _.merge(params, page.params);
          // end parse params


          yield page.controller.apply(page, page.params);
          parts = parseView(page.view);
        }


        // if we are redirecting, stop here and don't render the page
        if (page.redirecting) {
          return;
        }


        // layout controller
        // TODO auto attach existing js/css/less files
        if (page.layout) {
          page.layoutController = require('../controllers/layouts/' + page.layout + '.js');
          yield page.layoutController();
        }


        var autoAttachFileTypes = ['js', 'css', 'less'];
        var lessFiles = [];


        // attach files from the layout's dir
        if (page.layout) {
          autoAttachFileTypes.forEach(function(type) {
            var path = '/' + page.layout + '/' + page.layout + '.' + type;
            var filePath = publicDir + '/layouts' + path;
            if (type === 'less') {
              lessFiles.push(filePath);
            }
            if (fs.existsSync(filePath)) {
              page[type].push('/layouts' + path);
            }
          });
        }



        // attach files from the page's dir
        var folder = parts.path ? parts.path + '/' : '';
        autoAttachFileTypes.forEach(function(type) {
          var path = '/' + folder + parts.name + '/' + parts.name + '.' + type;
          var filePath = publicDir + '/pages' + path;
          if (fs.existsSync(filePath)) {
            if (type === 'less') {
              lessFiles.push(filePath);
            }
            page[type].push('/pages' + path);
          }
        });


        // before we render the layout, combine the less files
        // first let's check if we already cached the combined/rendered css file
        if (lessFiles.length > 0) {
          var lessInfo = [];
          lessFiles.forEach(function(filename) {
            lessInfo.push(filename);
            var stat = fs.statSync(filename);
            lessInfo.push(stat.mtime);
          });
          var hash = md5(lessInfo.join('!'));
          var cssFile = '/cache/less/' + hash + '.css';
          page.css.push(cssFile);
          mkdirp.sync(publicDir + '/cache/less');
          var cssFilePath = publicDir + cssFile;
          if (!fs.existsSync(cssFilePath)) {
            // combine tne less files into a css file
            var lessCode = '';
            var css = '';
            lessFiles.forEach(function(filename) {
              lessCode += fs.readFileSync(filename) + '\n\n\n';
            });
            if (lessCode) {
              less.render(lessCode, function (e, cssOutput) {
                if (e) {
                  console.log(e);
                  return e;
                }
                css = cssOutput;
              });
            }
            // cache to disk
            fs.writeFileSync(cssFilePath, css);
          }
        }

        // set the view path after the page controller to give the page
        // the ability to change the view
        var view = './pages/' + parts.path + '/' + parts.name + '/' + parts.name + '.html';

        this.body = yield render(view, page);

      }));
    });

  })();


  function parseView(view) {
    if (view === opts.index) {
      var uri = '/';
    }
    var div = view.lastIndexOf(path.sep);
    var pagePath = '';
    var pageName = view;
    if (div > 0) {
      pageName = view.substring(div + 1);
      pagePath = view.substring(0, div);
    }
    return {
      uri: uri || '/' + view.replace(/\$/g, ':'),
      path: pagePath,
      name: pageName
    };
  }


  return app;

};


