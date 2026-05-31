import { prisma } from '../db/client'
import { sign } from 'hono/jwt'
import type { AuthInput } from '../schemas/auth.schema'

const JWT_SECRET = process.env.API_KEY || 'fallback_secret' 

export const AuthService = {
  async register(data: AuthInput) {
    const existingUser = await prisma.user.findUnique({ 
      where: { email: data.email } 
    })
    if (existingUser) throw new Error('User already exists')

    const hashedPassword = await Bun.password.hash(data.password)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword
      }
    })

    const payload = {
      sub: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // Expires in 24 hours
    }

    const token = await sign(payload, JWT_SECRET)
    
    return { user: { id: user.id, email: user.email }, token }
  },

  async login(data: AuthInput) {
    const user = await prisma.user.findUnique({ 
      where: { email: data.email } 
    })
    if (!user) throw new Error('Invalid credentials')

    const isMatch = await Bun.password.verify(data.password, user.password)
    if (!isMatch) throw new Error('Invalid credentials')

    const payload = {
      sub: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
    }
    const token = await sign(payload, JWT_SECRET)

    return { user: { id: user.id, email: user.email }, token }
  }
}