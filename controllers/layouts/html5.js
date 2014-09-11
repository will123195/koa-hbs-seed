module.exports = function *() {

  this.js.push('/cache/handlebars/precompiled.js');
  this.js.push('//cdnjs.cloudflare.com/ajax/libs/handlebars.js/2.0.0-beta.1/handlebars.runtime.min.js');
  this.js.push('/layouts/html5/jquery.2.1.0.min.js');

  this.js.reverse();
  this.css.reverse();
  this.less.reverse();

  this.login = this.session.user;
};