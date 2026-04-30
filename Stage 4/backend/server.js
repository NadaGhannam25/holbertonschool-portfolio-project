const express = require('express')
const pool = require('./config/db')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())

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

app.use('/api/auth', require('./routes/auth'))

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
