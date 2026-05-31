import { Context } from 'hono'
import { z } from 'zod'
import { AuthService } from '../services/auth.service'
import { authSchema } from '../schemas/auth.schema'

export const AuthController = {
  async register(c: Context) {
    try {
      const rawBody = await c.req.json()
      const validData = authSchema.parse(rawBody)
      
      const result = await AuthService.register(validData)
      return c.json({ message: 'Registration successful', ...result }, 201)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: 'Validation failed', details: z.flattenError(error).fieldErrors}, 400)
      }
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400)
      }
      return c.json({ error: 'Internal Server Error' }, 500)
    }
  },

  async login(c: Context) {
    try {
      const rawBody = await c.req.json()
      const validData = authSchema.parse(rawBody)
      
      const result = await AuthService.login(validData)
      return c.json({ message: 'Login successful', ...result }, 200)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: 'Validation failed', details: z.flattenError(error).fieldErrors }, 400)
      }
      if (error instanceof Error) {
        return c.json({ error: error.message }, 401)
      }
      return c.json({ error: 'Internal Server Error' }, 500)
    }
  }
}