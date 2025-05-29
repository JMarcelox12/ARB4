import request from 'supertest'
import app from '../index.js'

describe('GET /', () => {
  it('should return status 200 and message', async () => {
    const response = await request(app).get('/')
    expect(response.status).toBe(200)
    expect(response.text).toBe('ARB funcionando!')
  })
})
