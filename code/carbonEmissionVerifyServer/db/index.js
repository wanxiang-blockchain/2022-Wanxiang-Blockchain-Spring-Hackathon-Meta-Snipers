import { Low, JSONFile } from 'lowdb'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

export async function getJsonByAddress(address) {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const file = join(__dirname, `./json/${address}.json`)
  const adapter = new JSONFile(file)
  const db = new Low(adapter)
  await db.read()

  return db
}

export async function getUserInfo() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const file = join(__dirname, `./json/user.json`)
  const adapter = new JSONFile(file)
  const db = new Low(adapter)
  await db.read()

  return db
}
