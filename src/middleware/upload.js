// Middleware pour gérer l'upload de fichiers avec multer
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
