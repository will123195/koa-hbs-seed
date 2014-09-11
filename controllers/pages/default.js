module.exports = function *() {
  this.layout = 'html5'
  this.title = 'koa-hbs-seed home page'

  if (!this.session.counter) this.session.counter = 0;
  this.session.counter++;
}