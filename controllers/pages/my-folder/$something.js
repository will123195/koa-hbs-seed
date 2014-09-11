module.exports = function *() {
  this.title = this.params.something
  this.layout = 'html5'
  this.view = 'default'
  this.disclaimer = 'This is a different controller using the "default" template'
}