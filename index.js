// Point d'entrée principal du backend Express
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Importation des routes
const adminRoutes = require('./src/routes/admin');
const userRoutes = require('./src/routes/user');

app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Express app listening on port ${PORT}`);
});
