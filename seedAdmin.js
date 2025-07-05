// seedAdmin.js
require('dotenv').config(); // ← Charge les variables d'environnement

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function seedAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT // ← Ajout du port depuis ton .env (attention au bon port !)
    });

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await connection.execute(
      `INSERT INTO User (name, email, password, is_admin)
       VALUES (?, ?, ?, ?)`,
      ['Admin', 'admin@biblio.com', hashedPassword, 1]
    );

    console.log("✅ Admin inserted successfully!");
    connection.end();
  } catch (error) {
    console.error("❌ Error inserting admin:", error.message);
  }
}

seedAdmin();
