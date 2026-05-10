import { verifyToken } from '@clerk/backend'

export async function getUserId(req) {
  const auth = req.headers['authorization'] ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    })
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
