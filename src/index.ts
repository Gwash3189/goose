import Koa from 'koa'
import { koaBody as KoaBody } from 'koa-body'
import logger from 'koa-pino-logger'
import { env } from './process'

import * as OwnersMiddleware from './actions/owners/middleware'
import * as DatabaseMiddleware from './database/middleware'
import * as Routes from './routes'
import * as Response from './response'

const app = new Koa()

app
  .use(KoaBody())
  .use(logger())
  .use(Response.bail)
  .use(DatabaseMiddleware.connect)
  .use(OwnersMiddleware.authenticate)

const router = Routes.register()

app.use(router.routes())
  .use(router.allowedMethods())

const paths = router
  .stack
  .filter((s) => s.methods.length !== 0)
  .map(s => s.methods
    .map(x => [x, s.path])
  ).flat()

console.log(new Date(), 'Router booting with the following routes and methods:\n', paths)

app.listen(env.PORT, () => {
  console.log(new Date(), `Server running on http://localhost:${env.PORT}`)
})
