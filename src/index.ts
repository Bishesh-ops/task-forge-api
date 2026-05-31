import { Hono } from 'hono'
import { TaskController } from './controllers/task.controller'
import { AuthController } from './controllers/auth.controller'

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
app.get('/tasks/:id', TaskController.getById)
app.patch('/tasks/:id', TaskController.update)
app.delete('/tasks/:id', TaskController.delete)
app.post('/auth/register', AuthController.register)
app.post('/auth/login', AuthController.login)

export{ app }
export default {
    port: 3000,
    fetch: app.fetch,
}