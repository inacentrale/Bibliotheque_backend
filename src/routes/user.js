const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Signup
router.post('/signup', userController.signup);
// Login
router.post('/login', userController.login);
// Get all books
router.get('/books', userController.getAllBooks);
// Borrow book
router.post('/books/:id/borrow', userController.borrowBook);
// Profile
router.get('/profile/:id', userController.getProfile);
// Récupérer tous les profils utilisateurs (pour la liste des emprunts)
router.get('/profile/all', userController.getAllProfiles);
// Search books
router.get('/search/:name', userController.searchBooks);
// Get available copies
router.get('/books/:id/available_copies', userController.getAvailableCopies);
// Get email by user id
router.get('/email/:id', userController.getEmailById);
// Demander un retour de livre
router.post('/request-return/:id', userController.requestReturn);
// Confirmer le retour (admin)
router.post('/confirm-return/:id', userController.confirmReturn);
// Lister les demandes de retour (admin)
router.get('/return-requests', userController.getReturnRequests);
// Nouvelle route pour lister les utilisateurs ayant fait un emprunt
router.get('/borrowed-users', async (req, res) => {
  try {
    const users = await require('../controllers/userController').getBorrowedUsers(req, res);
  } catch (err) {
    res.status(500).send(err.message);
  }
});
// Lister tous les livres empruntés par un utilisateur
router.get('/borrowed-books/:id', userController.getBorrowedBooksByUser);
// Renouveler un emprunt
router.post('/renew-book/:id', userController.renewBorrowedBook);
// Retourner un livre
router.post('/return-book/:id', userController.returnBorrowedBook);

// All routes already use userController, which is now MySQL-based.

module.exports = router;
