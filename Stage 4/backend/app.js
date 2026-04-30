const express = require('express')
const pool = require('./config/db')

const app = express()
app.use(express.json())

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({ message: 'Server is working and connected to the database!', time: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.use('/api/auth', require('./routes/auth'))
app.use('/api/categories', require('./routes/categories'))

module.exports = app
