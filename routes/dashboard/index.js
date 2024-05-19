const Router = require('@koa/router')

const router = new Router()

router.get('/dashboard', async (ctx) => {
  ctx.body = JSON.stringify('Hello dashboard')
})

module.exports = router
