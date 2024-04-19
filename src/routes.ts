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

  namespace('/owners', (router) => {
    router.get('/me', Owners.me)

    nest(router, '/api_keys', (router) => {
      router.post('/rotate', ApiKeys.rotate)
    })
  })

  namespace('/accounts', (router) => {
    router.get('/', Accounts.list)

    nest(router, '/:accountId', (router) => {
      router.post('/', Accounts.create)
        .get('/', Accounts.show)
        .put('/', Accounts.update)
        .delete('/', Accounts.del)

      nest(router, '/user', (router) => {
        router.post('/authenticate', Users.authenticate)
      })

      nest(router, '/users', (router) => {
        router.get('/', Users.list)

        nest(router, '/:userId', (router) => {
          router
            .use(Users.security)
            .get('/', Users.show)
            .post('/', Users.create)
            .delete('/', Users.del)
            .put('/', Users.update)
        })
      })
    })
  })

  return rootRouter
}
