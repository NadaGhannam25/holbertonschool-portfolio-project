const express = require('express')
const router = express.Router()
const pool = require('../config/db')

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id')
    res.json({ categories: result.rows })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
