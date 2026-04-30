const request = require('supertest')
const app = require('../app')

jest.setTimeout(30000)

describe('Auth Endpoints', () => {

  test('POST /api/auth/register - success', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: `test${Date.now()}@test.com`, password: '123456' })
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('message')
    expect(res.body).toHaveProperty('user')
  })

  test('POST /api/auth/register - missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' })
    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  test('POST /api/auth/login - success', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'shaden@test.com', password: '123456' })
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  test('POST /api/auth/login - wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'shaden@test.com', password: 'wrongpass' })
    expect(res.statusCode).toBe(401)
  })

  test('GET /api/auth/profile - no token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
    expect(res.statusCode).toBe(401)
  })

})
