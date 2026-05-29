import { Hono } from 'hono'
import { TaskController } from './controllers/task.controller'

const app = new Hono()

app.get('/', (c) => {
    return c.json({
        status: 'sucess',
        message: 'Task Forge API is live.',
        timestamp: new Date().toISOString()
    })
})

app.post('/tasks', TaskController.create)
app.get('/tasks', TaskController.getAll)

export default {
    port: 3000,
    fetch: app.fetch,
}