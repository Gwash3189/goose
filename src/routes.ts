import Router from 'koa-router'
import * as Health from './actions/health'
import * as Users from './actions/users'
import * as Accounts from './actions/accounts'
import * as Owners from './actions/owners'
import * as ApiKeys from './actions/api_keys'

const rootRouter = new Router()

function namespace (path: string, fn: (router: Router) => void): void {
  const router = new Router()
  fn(router)
  rootRouter.use(path, router.routes(), router.allowedMethods())
}

function nest (parentRouter: Router, path: string, fn: (router: Router) => void): void {
  const router = new Router()
  fn(router)
  parentRouter.use(path, router.routes(), router.allowedMethods())
}

export function register (): Router<any, {}> {
  namespace('/health', (router) => {
    router.get('/', Health.show)
  })

  namespace('/api-keys', (router) => {
    router
      .post('/rotate', ApiKeys.rotate)
      .post('/', ApiKeys.create)
  })

  namespace('/owners', (router) => {
    router.get('/me', Owners.me)
  })

  namespace('/accounts', (router) => {
    router
      .get('/', Accounts.list)
      .post('/', Accounts.create)

    nest(router, '/:accountId', (router) => {
      router
        .get('/', Accounts.show)
        .put('/', Accounts.update)
        .delete('/', Accounts.del)

      nest(router, '/users', (router) => {
        router
          .post('/authenticate', Users.authenticate)
          .get('/', Users.list)
          .post('/', Users.create)

        nest(router, '/:userId', (router) => {
          router
            .use(Users.security)
            .get('/', Users.show)
            .delete('/', Users.del)
            .put('/', Users.update)
        })
      })
    })
  })

  return rootRouter
}
