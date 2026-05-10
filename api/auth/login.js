import { neon } from '@neondatabase/serverless'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'

function getDb() { return neon(process.env.DATABASE_URL) }
function secret() { return new TextEncoder().encode(process.env.JWT_SECRET) }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body ?? {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const sql = getDb()
  const [user] = await sql`
    SELECT id, email, password_hash FROM users WHERE email = ${email.toLowerCase().trim()}
  `

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  const token = await new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setExpirationTime('30d')
    .setIssuedAt()
    .sign(secret())

  res.json({ token, email: user.email })
}
