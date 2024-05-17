const Router = require('@koa/router')

const router = new Router()

router.get('/chat', async (ctx) => {
  ctx.body = JSON.stringify('Hello Chat')
})

module.exports = router
