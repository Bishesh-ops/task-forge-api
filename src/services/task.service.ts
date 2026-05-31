import { prisma } from '../db/client'
import type { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema'

export const TaskService = {
  async createTask(userId: string, data: CreateTaskInput) {
    return await prisma.task.create({ 
      data: {
        ...data,
        userId
      } 
    })
  },

  async getAllTasks(userId: string, filters?: { status?: string, limit?: number }) {
    return await prisma.task.findMany({
      where: {
        userId, 
        ...(filters?.status ? { status: filters.status } : {})
      },
      take: filters?.limit || 100,
      orderBy: { createdAt: 'desc' }
    })
  },

  async getTaskById(userId: string, id: string) {
    return await prisma.task.findUnique({
      where: { id, userId }
    })
  },

  async updateTask(userId: string, id: string, data: UpdateTaskInput) {
    return await prisma.task.update({
      where: { id, userId },
      data
    })
  },

  async deleteTask(userId: string, id: string) {
    return await prisma.task.delete({
      where: { id, userId }
    })
  }
}