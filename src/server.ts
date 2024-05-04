import Koa from 'koa'
import logger from 'koa-pino-logger'
import { bodyParser } from '@koa/bodyparser'

import * as Routes from './routes'

const app = new Koa()

app
  .use(bodyParser())
  .use(logger())

const router = Routes.register()

app.use(router.routes())
  .use(router.allowedMethods())

export const Server = app
export const paths = router
  .stack
  .filter((s) => s.methods.length !== 0)
  .map(s => s.methods
    .map(x => [x, s.path])
  )
  .flat()
  .map(([method, path]) => `${(method as string).toUpperCase().padEnd(7)} ${(path as RegExp).toString()}`)
