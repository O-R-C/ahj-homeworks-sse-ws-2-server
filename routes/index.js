const combine = require('koa-combine-routers')

const index = require('./index/index')
const chat = require('./chat/')

const router = combine([index, chat])

module.exports = router
