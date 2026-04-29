const express = require('express')
const pool = require('./config/db')

require('dotenv').config()

const app = express()
const PORT = 4000

app.use(express.json())

// test route
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({
      message: 'Server is working and connected to the database!',
      time: result.rows[0]
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

