const combine = require('koa-combine-routers')

const index = require('./index/index')
const dashboard = require('./dashboard')

const router = combine([index, dashboard])

module.exports = router
