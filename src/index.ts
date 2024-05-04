import { Logger } from './logger'
import { env } from './process'
import { Server, paths } from './server'

Logger.info(new Date())
Logger.info('Router booting with the following routes and methods:\n')
Logger.info('\n' + paths.join('\n'))

Server.listen(env.PORT, () => {
  Logger.info(new Date())
  Logger.info(`Server running on http://localhost:${env.PORT}`)
})
