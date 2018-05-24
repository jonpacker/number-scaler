module.exports = app => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      if (e.status == 403 && !ctx.currentUser) {
        ctx.redirect('/login');
      } else {
        throw e;
      }
    }
  };
}
