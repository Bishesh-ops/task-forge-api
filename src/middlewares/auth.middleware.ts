import { jwt } from 'hono/jwt'

const JWT_SECRET = process.env.API_KEY || 'fallack_secret'
export const authMiddleware = jwt({
    secret: JWT_SECRET,
    alg: 'HS256',
})