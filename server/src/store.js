import { mkdirSync, readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs'
import { dirname } from 'node:path'

/** Tiny JSON-file store. Writes are atomic (temp file, then rename). Pass no file for an in-memory store. */
export function createStore(file) {
  let doc = null
  if (file && existsSync(file)) {
    try {
      doc = JSON.parse(readFileSync(file, 'utf8'))
    } catch {
      doc = null
    }
  }
  return {
    get: () => doc,
    set(next) {
      doc = next
      if (!file) return
      mkdirSync(dirname(file), { recursive: true })
      const tmp = `${file}.tmp`
      writeFileSync(tmp, JSON.stringify(next, null, 2))
      renameSync(tmp, file)
    },
  }
}
