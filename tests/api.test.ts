import { describe, it, expect } from 'bun:test'
import { app } from '../src/index'

describe('Task API Endpoints', () => {
  
  it('Should reject a task with an invalid priority', async () => {
    const response = await app.request('/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Learn Unit Testing',
        priority: 10 // Invalid! Max is 5.
      }),
    })
    expect(response.status).toBe(400)

    const data = await response.json()as any
    console.log(JSON.stringify(data.details, null, 2))
    expect(data.error).toBe('Validation failed')
    expect(data.details.priority).toBeDefined()
  })

  it('Should successfully create a valid task', async () => {
    const response = await app.request('/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Implement API Tests',
        priority: 1
      }),
    })

    expect(response.status).toBe(201)
    
    const data = await response.json() as any
    expect(data.message).toBe('Task created.')
    expect(data.task.title).toBe('Implement API Tests')
    expect(data.task.id).toBeDefined() 
  })

  it('Should fetch all tasks', async () => {
    const response = await app.request('/tasks', {
      method: 'GET'
    })

    expect(response.status).toBe(200)
    
    const data = await response.json() as any
    expect(Array.isArray(data.tasks)).toBe(true)
    expect(data.tasks.length).toBeGreaterThan(0) 
  })
})