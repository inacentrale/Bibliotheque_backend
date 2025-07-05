CREATE DATABASE IF NOT EXISTS `library`;
USE library;



CREATE DATABASE IF NOT EXISTS `library`;  



CREATE TABLE `User` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `borrowed_book` VARCHAR(255),
    `return_date` VARCHAR(255),
    `is_admin` TINYINT(1) NOT NULL DEFAULT 0,
    `return_requested` BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE `Book` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `isbn` VARCHAR(20) NOT NULL UNIQUE,
    `title` VARCHAR(255) NOT NULL,
    `author` VARCHAR(255) NOT NULL,
    `genre` VARCHAR(255) NOT NULL,
    `published_year` INT NOT NULL,
    `cover_url` VARCHAR(255),
    `available_copies` INT NOT NULL
);


CREATE TABLE BorrowedBooks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  borrow_date DATE NOT NULL,
  due_date DATE NOT NULL,
  renewal_count INT DEFAULT 0,
  max_renewals INT DEFAULT 2,
  is_overdue BOOLEAN DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES User(id),
  FOREIGN KEY (book_id) REFERENCES Book(id)
);

-- Index for email uniqueness
CREATE UNIQUE INDEX `User_email_key` ON `User`(`email`);

-- Insertion de 10 livres de test
INSERT INTO `Book` (`isbn`, `title`, `author`, `genre`, `published_year`, `cover_url`, `available_copies`) VALUES
('978-1234567890', 'Introduction à l''Informatique', 'Jean Dupont', 'Informatique', 2023, 'https://via.placeholder.com/100x140/4F46E5/FFFFFF?text=IT', 5),
('978-2345678901', 'Histoire de France', 'Marie Martin', 'Histoire', 2022, 'https://via.placeholder.com/100x140/DC2626/FFFFFF?text=HIS', 3),
('978-3456789012', 'Calcul Différentiel', 'Pierre Leblanc', 'Mathématiques', 2021, 'https://via.placeholder.com/100x140/059669/FFFFFF?text=MATH', 2),
('978-4567890123', 'Littérature Française Moderne', 'Sophie Bernard', 'Littérature', 2023, 'https://via.placeholder.com/100x140/7C2D12/FFFFFF?text=LIT', 4),
('978-5678901234', 'Physique Quantique', 'Michel Durand', 'Physique', 2020, 'https://via.placeholder.com/100x140/1E40AF/FFFFFF?text=PHY', 1),
('978-6789012345', 'Économie Internationale', 'Catherine Moreau', 'Économie', 2022, 'https://via.placeholder.com/100x140/B45309/FFFFFF?text=ECO', 6),
('978-7890123456', 'Programmation Web', 'Lucas Petit', 'Informatique', 2024, 'https://via.placeholder.com/100x140/0EA5E9/FFFFFF?text=WEB', 7),
('978-8901234567', 'Chimie Organique', 'Claire Girard', 'Chimie', 2021, 'https://via.placeholder.com/100x140/EA580C/FFFFFF?text=CHIM', 2),
('978-9012345678', 'Droit Constitutionnel', 'Antoine Lefevre', 'Droit', 2023, 'https://via.placeholder.com/100x140/16A34A/FFFFFF?text=DRT', 3),
('978-0123456789', 'Psychologie Cognitive', 'Isabelle Laurent', 'Psychologie', 2022, 'https://via.placeholder.com/100x140/7C3AED/FFFFFF?text=PSY', 5);

