const Koa = require('koa');
const Pug = require('koa-pug');
const Router = require('koa-router');
const browserify = require('./lib/browserify');
const IS_DEV = process.env.NODE_ENV == 'development';

var app = new Koa();

app.use(require('./lib/errors')(app));

const router = app.router = new Router();
if (IS_DEV) app.use(require('koa-logger')());

const pug = new Pug({
  viewPath: './views',
  debug: IS_DEV,
  noCache: IS_DEV,
  locals: {
    siteTitle: "Number Scaler",
    moment
  }
});

require('./routes/index')(app);

router.get('/js/scaler.js', browserify(app, `${__dirname}/public/js/scaler.js`));

app.use(router.routes())
app.use(router.allowedMethods());
app.use(require('./lib/stylus-middleware')('./public'));
app.use(require('koa-static')('./public'));
pug.use(app);

app.listen(3001);
