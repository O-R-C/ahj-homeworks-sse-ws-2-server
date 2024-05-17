const Router = require('@koa/router')
const router = new Router()

router.get('/index', async (ctx) => {
  ctx.body = JSON.stringify('Hello World')
})

module.exports = router
