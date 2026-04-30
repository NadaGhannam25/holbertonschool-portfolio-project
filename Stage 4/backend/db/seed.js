const pool = require('../config/db')

const categories = [
  'ترفيه',
  'عمل',
  'تعليم',
  'صحة',
  'أخرى'
]

async function seedCategories() {
  try {
    for (let name of categories) {
      await pool.query(
        `INSERT INTO categories (name)
         VALUES ($1)
         ON CONFLICT (name) DO NOTHING`,
        [name]
      )
    }

    console.log('Categories seeded successfully')
  } catch (err) {
    console.error('Seeding error:', err.message)
  } finally {
    process.exit()
  }
}

seedCategories()
