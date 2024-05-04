import Router from '@koa/router'
import * as OwnersMiddleware from './actions/owners/middleware'
import * as DatabaseMiddleware from './database/middleware'
import * as Response from './response'
import * as Health from './actions/health'
import * as Users from './actions/users'
import * as Accounts from './actions/accounts'
import * as Owners from './actions/owners'
import * as ApiKeys from './actions/api_keys'

const rootRouter = new Router()

function use (fn: Router.Middleware, router?: Router): void {
  (router != null) ? router.use(fn) : rootRouter.use(fn)
}

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
  use(Response.bail)
  use(DatabaseMiddleware.connect)

  namespace('/health', (router) => {
    router.get('/', Health.show)
  })

  namespace('/', (router) => {
    use(OwnersMiddleware.authenticate, router)

    nest(router, 'api-keys', (router) => {
      router
        .post('/rotate', ApiKeys.rotate)
        .post('/verify', ApiKeys.verify)
        .post('/revoke', ApiKeys.revoke)
        .post('/', ApiKeys.create)
    })

    nest(router, 'owners', (router) => {
      router.get('/me', Owners.me)
    })

    nest(router, 'accounts', (router) => {
      router
        .get('/', Accounts.list)
        .post('/', Accounts.create)

      nest(router, '/:accountId', (router) => {
        router
          .get('/', Accounts.show)
          .put('/', Accounts.update)
          .delete('/', Accounts.del)

        // nest(router, '/api-keys', (router) => {
        //   router.get('/', ApiKeys.list)
        // })

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

            // nest(router, '/api-keys', (router) => {
            //   router.get('/', ApiKeys.list)
            // })
          })
        })
      })
    })
  })

  return rootRouter
}
