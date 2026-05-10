import { createRemoteJWKSet, jwtVerify } from 'jose'

let JWKS

function getJWKS() {
  if (!JWKS) {
    JWKS = createRemoteJWKSet(
      new URL(`${process.env.NEON_AUTH_BASE_URL}/.well-known/jwks.json`)
    )
  }
  return JWKS
}

export async function getUserId(req) {
  const auth = req.headers['authorization'] ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getJWKS())
    return payload.sub ?? null
  } catch {
    return null
  }
}

export function requireAuth(handler) {
  return async (req, res) => {
    const userId = await getUserId(req)
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    return handler(req, res, userId)
  }
}
