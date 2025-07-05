const db = require('../../db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

module.exports = {
  signup: async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query('INSERT INTO User (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
      const [user] = await db.query('SELECT * FROM User WHERE email = ?', [email]);
      res.json({ message: 'Inscription réussie', user: user[0] });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const [users] = await db.query('SELECT * FROM User WHERE email = ?', [email]);
      const user = users[0];
      if (!user) return res.status(401).send('Invalid email or password');
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).send('Invalid email or password');
      res.json({ userId: user.id, is_admin: user.is_admin });
    } catch (err) {
      res.status(500).send(err.message);
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
  borrowBook: async (req, res) => {
    const userId = Number(req.params.id);
    const { book_id, book_name, date } = req.body;
    try {
      // Log pour debug
      console.log('[DEBUG] Tentative emprunt:', { userId, book_id, book_name, date });
      // Vérifier si le livre est déjà emprunté par cet utilisateur
      const [alreadyBorrowed] = await db.query('SELECT * FROM BorrowedBooks WHERE user_id = ? AND book_id = ?', [userId, book_id]);
      if (alreadyBorrowed.length > 0) {
        console.log('[DEBUG] Déjà emprunté:', alreadyBorrowed);
        return res.status(400).send('Vous avez déjà emprunté ce livre.');
      }
      // Vérifier le nombre de livres déjà empruntés (optionnel, selon maxBooks)
      // const [count] = await db.query('SELECT COUNT(*) as nb FROM BorrowedBooks WHERE user_id = ?', [userId]);
      // if (count[0].nb >= 5) return res.status(400).send('Limite de livres atteinte.');
      await db.query('UPDATE Book SET available_copies = available_copies - 1 WHERE id = ?', [book_id]);
      const insertResult = await db.query('INSERT INTO BorrowedBooks (user_id, book_id, borrow_date, due_date) VALUES (?, ?, CURDATE(), ?)', [userId, book_id, date]);
      console.log('[DEBUG] Insert BorrowedBooks result:', insertResult);
      res.status(200).send('Booked Successfully!');
    } catch (err) {
      console.error('[DEBUG] Erreur emprunt:', err);
      res.status(500).send(err.message);
    }
  },
  getProfile: async (req, res) => {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
      return res.status(400).send('User id is required');
    }
    try {
      const [users] = await db.query('SELECT name, email, borrowed_book, return_date FROM User WHERE id = ?', [id]);
      res.json(users[0]);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  searchBooks: async (req, res) => {
    try {
      const [books] = await db.query('SELECT * FROM Book WHERE title LIKE ?', [`%${req.params.name}%`]);
      res.json(books);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getAvailableCopies: async (req, res) => {
    try {
      const [books] = await db.query('SELECT available_copies FROM Book WHERE id = ?', [req.params.id]);
      res.json(books[0]);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getEmailById: async (req, res) => {
    const user = await db.query('SELECT email FROM User WHERE id = ?', [req.params.id]);
    res.json({ email: user[0]?.email });
  },
  requestReturn: async (req, res) => {
    const userId = Number(req.params.id);
    try {
      await db.query('UPDATE User SET return_requested = true WHERE id = ?', [userId]);
      res.json({ message: 'Demande de retour envoyée.' });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  confirmReturn: async (req, res) => {
    const userId = Number(req.params.id);
    try {
      await db.query('UPDATE User SET borrowed_book = null, return_date = null, return_requested = false WHERE id = ?', [userId]);
      res.json({ message: 'Retour confirmé.' });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getReturnRequests: async (req, res) => {
    try {
      const users = await db.query('SELECT * FROM User WHERE return_requested = true');
      res.json(users);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getAllProfiles: async (req, res) => {
    try {
      const users = await db.query('SELECT id, name, email, borrowed_book, return_date, return_requested FROM User WHERE borrowed_book IS NOT NULL');
      const usersWithBook = await Promise.all(users.map(async (user) => {
        let book = null;
        if (user.borrowed_book) {
          book = await db.query('SELECT * FROM Book WHERE title = ?', [user.borrowed_book]);
        }
        return { ...user, book: book[0] };
      }));
      res.json(usersWithBook);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getBorrowedUsers: async (req, res) => {
    try {
      const [usersWithBook] = await db.query('SELECT * FROM User WHERE borrowed_book IS NOT NULL');
      res.json(usersWithBook);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  // Nouvelle route : lister tous les livres empruntés par un utilisateur
  getBorrowedBooksByUser: async (req, res) => {
    const userId = Number(req.params.id);
    try {
      // On suppose qu'il existe une table BorrowedBooks avec user_id, book_id, borrow_date, due_date, renewal_count, etc.
      const [borrowed] = await db.query(`
        SELECT b.id, b.title, b.author, b.genre, b.cover_image, bb.borrow_date, bb.due_date, bb.renewal_count, bb.max_renewals, bb.is_overdue, b.isbn
        FROM BorrowedBooks bb
        JOIN Book b ON bb.book_id = b.id
        WHERE bb.user_id = ?
      `, [userId]);
      res.json(borrowed);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },

  // Nouvelle route : renouveler un emprunt
  renewBorrowedBook: async (req, res) => {
    const userId = Number(req.params.id);
    const { book_id } = req.body;
    try {
      // Vérifier le nombre de renouvellements et la date
      const [rows] = await db.query('SELECT * FROM BorrowedBooks WHERE user_id = ? AND book_id = ?', [userId, book_id]);
      const borrowed = rows[0];
      if (!borrowed) return res.status(404).send('Emprunt non trouvé');
      if (borrowed.renewal_count >= borrowed.max_renewals) return res.status(400).send('Nombre maximum de renouvellements atteint');
      if (borrowed.is_overdue) return res.status(400).send('Impossible de renouveler un livre en retard');
      // Prolonger la date de retour de 30 jours
      const newDueDate = new Date(borrowed.due_date);
      newDueDate.setDate(newDueDate.getDate() + 30);
      await db.query('UPDATE BorrowedBooks SET due_date = ?, renewal_count = renewal_count + 1 WHERE user_id = ? AND book_id = ?', [newDueDate.toISOString().split('T')[0], userId, book_id]);
      res.json({ message: `Emprunt renouvelé jusqu'au ${newDueDate.toLocaleDateString('fr-FR')}` });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },

  // Nouvelle route : retourner un livre
  returnBorrowedBook: async (req, res) => {
    const userId = Number(req.params.id);
    const { book_id } = req.body;
    console.log('[DEBUG] Retour livre:', { userId, book_id });
    try {
      // Supprimer l'entrée d'emprunt
      await db.query('DELETE FROM BorrowedBooks WHERE user_id = ? AND book_id = ?', [userId, book_id]);
      // Incrémenter le nombre de copies disponibles
      await db.query('UPDATE Book SET available_copies = available_copies + 1 WHERE id = ?', [book_id]);
      res.json({ message: 'Livre retourné avec succès' });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
};
