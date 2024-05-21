// const fs = require('fs')
const HTTP = require('http')
const path = require('path')
const cors = require('@koa/cors')
const koaStatic = require('koa-static')
const { koaBody } = require('koa-body')
const router = require('./routes')
const Koa = require('koa')
const WS = require('ws')
const CloudDashboard = require('./js/CloudDashboard')
const ArrayStorage = require('./js/ArrayStorage')

const app = new Koa()
const server = HTTP.createServer(app.callback())

app.use(
  cors({
    origin: '*',
    credentials: true,
    'Access-Control-Allow-Origin': true,
    allowMethods: ['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'],
  }),
)
app.use(koaStatic(path.join(__dirname, 'public')))
app.use(koaBody({ json: true, text: true, urlencoded: true, multipart: true }))
app.use(router())

const wss = new WS.Server({ server, path: '/dashboard' })
const dashboard = new CloudDashboard(wss, new ArrayStorage())

dashboard.init()

app.on('error', (err) => {
  console.error(err)
})

app.on('close', () => {
  console.log('App is closed')
  wss.close()
})

app.on('exit', () => {
  wss.close()
})

server.listen(process.env.PORT || 10000)
