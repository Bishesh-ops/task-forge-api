import{prisma} from '../db/client'

type CreateTaskInput = {
    title: string,
    description?: string,
    status?: string,
    priority: number,
}

export const TaskService = {
    async createTask(data: CreateTaskInput){
        return await prisma.task.create({data})
    },
    async getAllTasks(){
        return await prisma.task.findMany({
            orderBy: {createdAt:'desc'},
        })
    }
}