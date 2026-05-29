import { prisma } from '../db/client'
import type { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema'

export const TaskService = {
  async createTask(data: CreateTaskInput) {
    return await prisma.task.create({ data })
  },

  async getAllTasks() {
    return await prisma.task.findMany({
      orderBy: { createdAt: 'desc' }
    })
  },

  async getTaskById(id: string) {
    return await prisma.task.findUnique({
      where: { id }
    })
  },

  async updateTask(id: string, data: UpdateTaskInput) {
    return await prisma.task.update({
      where: { id },
      data
    })
  },

  async deleteTask(id: string) {
    return await prisma.task.delete({
      where: { id }
    })
  }
}