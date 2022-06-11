import Koa from 'koa'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import 'dotenv/config'
import forestRouter from './controllers/forest.js'
const app = new Koa()

app.use(logger())
app.use(bodyParser())
app.use(forestRouter.routes())

app.listen(3000, () => {
  console.log(`🚀 server listening on http://localhost:3000`)
})
