import { Context } from 'hono'
import { z } from 'zod'
import { TaskService } from '../services/task.service'
import { taskSchema, updateTaskSchema } from '../schemas/task.schema'

export const TaskController = {
  async create(c: Context) {
    try {
      const payload = c.get('jwtPayload')as any
      const userId = payload.sub

      const rawBody = await c.req.json()
      const validTask = taskSchema.parse(rawBody)
      
      const createdTask = await TaskService.createTask(userId, validTask)
      
      return c.json({ message: 'Task created.', task: createdTask }, 201)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: 'Validation failed', details: error.flatten().fieldErrors }, 400)
      }
      return c.json({ error: 'Internal Server Error' }, 500)
    }
  },

  async getAll(c: Context) {
    try {
      const payload = c.get('jwtPayload') as any
      const userId = payload.sub

      const status = c.req.query('status')
      const limitParam = c.req.query('limit')
      const limit = limitParam ? parseInt(limitParam) : undefined

      const allTasks = await TaskService.getAllTasks(userId, { status, limit })
      return c.json({ tasks: allTasks })
    } catch (error) {
      return c.json({ error: 'Failed to fetch tasks' }, 500)
    }
  },

  async getById(c: Context) {
    try {
      const payload = c.get('jwtPayload') as any
      const userId = payload.sub

      const id = c.req.param('id')
      if (!id) return c.json({ error: 'Task ID is required' }, 400)

      const task = await TaskService.getTaskById(userId, id)
      if (!task) return c.json({ error: 'Task not found' }, 404)
      
      return c.json({ task })
    } catch (error) {
      return c.json({ error: 'Failed to fetch task' }, 500)
    }
  },

  async update(c: Context) {
    try {
      const payload = c.get('jwtPayload') as any
      const userId = payload.sub

      const id = c.req.param('id')
      if (!id) return c.json({ error: 'Task ID is required' }, 400)

      const rawBody = await c.req.json()
      const validUpdate = updateTaskSchema.parse(rawBody)
      
      const updatedTask = await TaskService.updateTask(userId, id, validUpdate)
      return c.json({ message: 'Task updated', task: updatedTask })
    } catch (error) {
      // Prisma throws P2025 if it cannot find the record to update
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
         return c.json({ error: 'Task not found' }, 404)
      }
      if (error instanceof z.ZodError) {
        return c.json({ error: 'Validation failed', details: error.flatten().fieldErrors }, 400)
      }
      return c.json({ error: 'Failed to update task' }, 500)
    }
  },

  async delete(c: Context) {
    try {
      const payload = c.get('jwtPayload') as any
      const userId = payload.sub

      const id = c.req.param('id')
      if (!id) return c.json({ error: 'Task ID is required' }, 400)

      await TaskService.deleteTask(userId, id)
      return c.json({ message: 'Task deleted successfully' }, 200)
    } catch (error) {
      // Prisma throws P2025 if it cannot find the record to delete
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
         return c.json({ error: 'Task not found' }, 404)
      }
      return c.json({ error: 'Failed to delete task' }, 500)
    }
  }
}