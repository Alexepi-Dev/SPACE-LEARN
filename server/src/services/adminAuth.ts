import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { ApiError } from '../middleware/apiError.js'

const scrypt = promisify(scryptCallback)
const TOKEN_TTL_SECONDS = 15 * 60
const SCRYPT_KEY_BYTES = 64

export interface AdminIdentity {
  email: string
  role: 'superadmin'
}

interface AdminTokenPayload extends AdminIdentity {
  expiresAt: number
}

export async function createPasswordHash(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await requireScrypt(password, salt, SCRYPT_KEY_BYTES)
  return `scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`
}

async function requireScrypt(password: string, salt: Buffer, keyLength: number): Promise<Buffer> {
  const key = await scrypt(password, salt, keyLength)
  if (!Buffer.isBuffer(key)) throw new Error('Unable to derive password hash.')
  return key
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  const [algorithm, encodedSalt, encodedKey, extra] = encodedHash.split('$')
  if (algorithm !== 'scrypt' || !encodedSalt || !encodedKey || extra !== undefined) return false

  try {
    const salt = Buffer.from(encodedSalt, 'base64url')
    const expectedKey = Buffer.from(encodedKey, 'base64url')
    if (salt.length !== 16 || expectedKey.length !== SCRYPT_KEY_BYTES) return false
    const actualKey = await requireScrypt(password, salt, expectedKey.length)
    return timingSafeEqual(actualKey, expectedKey)
  } catch {
    return false
  }
}

export function createAdminToken(identity: AdminIdentity, secret: string, now = Date.now()): {
  token: string
  expiresAt: string
} {
  const payload: AdminTokenPayload = {
    ...identity,
    expiresAt: Math.floor(now / 1000) + TOKEN_TTL_SECONDS,
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', secret).update(encodedPayload).digest('base64url')
  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: new Date(payload.expiresAt * 1000).toISOString(),
  }
}

export function verifyAdminToken(token: string, secret: string, now = Date.now()): AdminIdentity {
  const [encodedPayload, providedSignature, extra] = token.split('.')
  if (!encodedPayload || !providedSignature || extra !== undefined) {
    throw new ApiError(401, 'ADMIN_UNAUTHORIZED', 'Administrator authentication is required.')
  }

  const expectedSignature = createHmac('sha256', secret).update(encodedPayload).digest()
  let actualSignature: Buffer
  try {
    actualSignature = Buffer.from(providedSignature, 'base64url')
  } catch {
    throw new ApiError(401, 'ADMIN_UNAUTHORIZED', 'Administrator authentication is required.')
  }
  if (
    actualSignature.length !== expectedSignature.length
    || !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    throw new ApiError(401, 'ADMIN_UNAUTHORIZED', 'Administrator authentication is required.')
  }

  try {
    const payload: unknown = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))
    if (
      !payload
      || typeof payload !== 'object'
      || !('email' in payload)
      || typeof payload.email !== 'string'
      || !('role' in payload)
      || payload.role !== 'superadmin'
      || !('expiresAt' in payload)
      || typeof payload.expiresAt !== 'number'
      || payload.expiresAt <= Math.floor(now / 1000)
    ) {
      throw new Error('Invalid administrator token.')
    }
    return { email: payload.email, role: payload.role }
  } catch {
    throw new ApiError(401, 'ADMIN_UNAUTHORIZED', 'Administrator authentication is required.')
  }
}

