import { Hono } from 'hono'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { PrismaBunSqlite } from 'prisma-adapter-bun-sqlite'

const app = new Hono()

const adapter = new PrismaBunSqlite({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

const taskSchema = z.object({
    title: z.string().min(3, "Title must be atleast 3 characters."),
    description: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
    priority: z.number().int().min(1).max(5)
})

app.get('/', (c) => {
    return c.json({
        status: 'sucess',
        message: 'Task Forge API is live.',
        timestamp: new Date().toISOString()
    })
})

app.post('/tasks', async (c) => {
  try {
    const rawBody = await c.req.json()

    const validTask = taskSchema.parse(rawBody)
    const createdTask = await prisma.task.create({
        data:{
            title: validTask.title,
            description: validTask.description,
            status: validTask.status,
            priority: validTask.priority
        }
    })
    return c.json({
        message: 'Task stored in the database sucessfully.',
        task: createdTask
    }, 201)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: 'Validation failed', 

        details: z.treeifyError(error)
      }, 400)
    }
    
    // If Prisma throws a database error, it will log here
    console.error(error) 
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

app.get('/tasks', async(c) =>{
	try{
		const allTasks = await prisma.task.findMany({
			orderBy:{
				createdAt: 'desc' // descending
			}
		})
		return c.json({tasks: allTasks})
	} catch(error){
		return c.json({error: 'Failed to fetch tasks'})
	}
})

export default {
    port: 3000,
    fetch: app.fetch,
}