import { fileURLToPath } from 'node:url'
import { createApp } from './app.js'
import { createStore } from './store.js'

const port = Number(process.env.PORT ?? 4000)
const file = process.env.DATA_FILE ?? fileURLToPath(new URL('../data/db.json', import.meta.url))
createApp(createStore(file)).listen(port, () => console.log(`SupplyTrust API on http://localhost:${port} (data: ${file})`))
