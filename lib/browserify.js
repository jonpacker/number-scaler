const browserify = require('browserify-middleware');
module.exports = (app, filename) => {
  const middleware = browserify(filename, {
    transform: [
      ['babelify', {
        presets: [['env', {
          targets: {
            browsers: [
              "Chrome >= 52",
              "FireFox >= 44",
              "Safari >= 7",
              "Explorer 11",
              "last 4 Edge versions"
            ]
          },
          useBuiltIns: true
        }], ['react']],
        plugins: ["transform-object-rest-spread"]
      }]
    ]
  });

  const compile = (req, res) => new Promise((resolve, reject) => {
    middleware(req, res, err => err ? reject(err) : resolve());
  });

  return async function(ctx, next) {
    ctx.status = 200;
    await compile(ctx.req, ctx.res);
    await next();
  };
}
