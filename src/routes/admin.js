const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middleware/upload');

// Admin login
router.post('/login', adminController.login);
// Get all books
router.get('/books', adminController.getAllBooks);
// Add book with cover upload
router.post('/books', upload.single('cover'), adminController.addBook);
// Get book by id
router.get('/books/:id', adminController.getBookById);
// Update book
router.put('/books/:id', adminController.updateBook);
// Delete book
router.delete('/books/:id', adminController.deleteBook);
// Get all users (students)
router.get('/users', adminController.getAllUsers);
// Add user (student)
router.post('/users', adminController.addUser);
// Update user (student)
router.put('/users/:id', adminController.updateUser);
// Delete user (student)
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
