const db = require('../../db');
const bcrypt = require('bcrypt');
const cloudinary = require('../utils/cloudinary');

module.exports = {
  login: async (req, res) => {
    const { user_name, pass } = req.body;
    if (user_name === 'Admin' && pass === 'admin123') {
      // Authentification simple (à remplacer par JWT ou session en prod)
      res.status(200).send('WELCOME ADMIN');
    } else {
      res.status(400).send('Wrong Credentials');
    }
  },
  getAllBooks: async (req, res) => {
    try {
      const [books] = await db.query('SELECT * FROM Book');
      res.json(books);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  addBook: async (req, res) => {
    try {
      let coverUrl = null;
      if (req.file) {
        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) throw error;
          coverUrl = result.secure_url;
        });
        // Utilisation de stream pour multer
        const streamifier = require('streamifier');
        await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream((error, result) => {
            if (error) return reject(error);
            coverUrl = result.secure_url;
            resolve();
          });
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      }
      const { title, author, genre, published_year, available_copies, isbn } = req.body;
      const [result] = await db.query(
        'INSERT INTO Book (title, author, genre, published_year, available_copies, isbn, cover_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, author, genre, published_year, available_copies, isbn, coverUrl]
      );
      const [book] = await db.query('SELECT * FROM Book WHERE id = ?', [result.insertId]);
      res.json(book[0]);
    } catch (err) {
      console.error('[DEBUG] addBook SQL error:', err);
      res.status(500).send(err.message);
    }
  },
  getBookById: async (req, res) => {
    try {
      const [book] = await db.query('SELECT * FROM Book WHERE id = ?', [Number(req.params.id)]);
      res.json(book[0]);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  updateBook: async (req, res) => {
    const { title, author, genre, published_year, available_copies } = req.body;
    try {
      await db.query(
        'UPDATE Book SET title=?, author=?, genre=?, published_year=?, available_copies=? WHERE id=?',
        [title, author, genre, published_year, available_copies, Number(req.params.id)]
      );
      const [book] = await db.query('SELECT * FROM Book WHERE id = ?', [Number(req.params.id)]);
      res.json(book[0]);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  deleteBook: async (req, res) => {
    try {
      await db.query('DELETE FROM Book WHERE id = ?', [Number(req.params.id)]);
      res.send('Deleted Successfully!');
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  // --- CRUD étudiants (users) pour admin ---
  getAllUsers: async (req, res) => {
    try {
      const [users] = await db.query(`
        SELECT u.id, u.name, u.email,
          (SELECT COUNT(*) FROM BorrowedBooks b WHERE b.user_id = u.id) AS borrowedBooks
        FROM User u
        WHERE u.is_admin = 0
      `);
      res.json(users);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  addUser: async (req, res) => {
    const { name, email } = req.body;
    try {
      const [result] = await db.query(
        'INSERT INTO User (name, email, password) VALUES (?, ?, ?)',
        [name, email, '']
      );
      const [user] = await db.query('SELECT id, name, email FROM User WHERE id = ?', [result.insertId]);
      res.json(user[0]);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  updateUser: async (req, res) => {
    const { name, email } = req.body;
    try {
      await db.query(
        'UPDATE User SET name=?, email=? WHERE id=?',
        [name, email, Number(req.params.id)]
      );
      const [user] = await db.query('SELECT id, name, email FROM User WHERE id = ?', [Number(req.params.id)]);
      res.json(user[0]);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  deleteUser: async (req, res) => {
    try {
      await db.query('DELETE FROM User WHERE id = ?', [Number(req.params.id)]);
      res.send('Deleted Successfully!');
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
};
