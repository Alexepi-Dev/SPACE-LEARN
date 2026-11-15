import { createApp } from './app.js'
import { loadServerConfig } from './config/env.js'

const config = loadServerConfig()
const app = createApp(config)

app.listen(config.port, '0.0.0.0', () => {
  console.info(`[api] Listening on port ${config.port}`)
})
