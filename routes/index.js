module.exports = app => {
  app.router.get('/', ctx => {
    ctx.render('index');
  });
}
