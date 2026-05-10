import { neon } from '@neondatabase/serverless'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'

function getDb() { return neon(process.env.DATABASE_URL) }
function secret() { return new TextEncoder().encode(process.env.JWT_SECRET) }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body ?? {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

  const sql = getDb()
  const [existing] = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}`
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const passwordHash = await bcrypt.hash(password, 12)
  const [user] = await sql`
    INSERT INTO users (email, password_hash)
    VALUES (${email.toLowerCase().trim()}, ${passwordHash})
    RETURNING id, email
  `

  const token = await new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setExpirationTime('30d')
    .setIssuedAt()
    .sign(secret())

  res.status(201).json({ token, email: user.email })
}
