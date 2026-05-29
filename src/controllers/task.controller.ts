import { Context } from 'hono'
import { z } from 'zod'
import { TaskService } from '../services/task.service'

const taskSchema = z.object({
  title: z.string().min(3, "Title must be atleast 3 characters."),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  priority: z.number().int().min(1).max(5)
})

export const TaskController = {
  async create(c: Context) {
    try {
      const rawBody = await c.req.json()
      const validTask = taskSchema.parse(rawBody)
      
      const createdTask = await TaskService.createTask(validTask)
      
      return c.json({
        message: 'Task stored in the database sucessfully.',
        task: createdTask
      }, 201)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: 'Validation failed', details: z.treeifyError(error) }, 400)
      }
      return c.json({ error: 'Internal Server Error' }, 500)
    }
  },

  async getAll(c: Context) {
    try {
      const allTasks = await TaskService.getAllTasks()
      return c.json({ tasks: allTasks })
    } catch (error) {
      return c.json({ error: 'Failed to fetch tasks' }, 500)
    }
  }
}