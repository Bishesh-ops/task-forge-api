import { z } from 'zod'

export const authSchema = z.object({
    email: z.email("Invalid email format"),
    password: z.string().min(8, "Password length must be atleast 8 characters")
})

export type AuthInput = z.infer<typeof authSchema>