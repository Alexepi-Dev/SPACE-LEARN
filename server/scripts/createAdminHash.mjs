import { randomBytes, scrypt as scryptCallback } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD

if (!password || password.length < 12) {
  throw new Error('Set ADMIN_BOOTSTRAP_PASSWORD to a password of at least 12 characters.')
}

const salt = randomBytes(16)
const key = await scrypt(password, salt, 64)
if (!Buffer.isBuffer(key)) throw new Error('Unable to derive password hash.')
console.log(`scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`)
