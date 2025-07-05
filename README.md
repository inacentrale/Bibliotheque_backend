##  Technologies utilisées
- **Backend** : Node.js, Express.js
- **Base de données** : MySQL
- **Auth** : bcrypt, JWT
- **Fichiers** : multer + Cloudinary

---

##  Installation (en local)

### 1. Cloner le projet

```bash
git clone https://github.com/inacentrale/Bibliotheque_backend.git

```
### 2. Installer les dépendances du backend

cd backend
npm install
npm install cloudinary
npm install multer

-------

Pour accéder au dashboard admin, vous devez d’abord créer un compte administrateur.
Exécutez le script suivant dans le dossier backend : node seedAdmin.js


Cela va insérer un compte admin dans la base de données :

Email : admin@biblio.com
Mot de passe : admin123

 Pour lancer le Backend : nodemon

### Schéma simplifié de la base de données_
User
- id (PK)
- name
- email (unique)
- password
- is_admin (bool)
- return_requested (bool)

Book
- id (PK)
- isbn (unique)
- title
- author
- genre
- published_year
- cover_image
- available_copies

BorrowedBooks
- id (PK)
- user_id (FK → User)
- book_id (FK → Book)
- borrow_date
- due_date
- renewal_count
- max_renewals
- is_overdue

