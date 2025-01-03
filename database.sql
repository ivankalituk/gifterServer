CREATE TABLE gift (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
	photoPath VARCHAR(255) NOT NULL,
    userViews INT DEFAULT 0,
    reating FLOAT,
    appreciators INT DEFAULT 0,
    addDate DATETIME DEFAULT CURRENT_TIMESTAMP,
	creatorId INT NOT NULL,
    adminId INT NOT NULL,
    tags VARCHAR(255) NOT NULL
)

CREATE TABLE report (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    content VARCHAR(255) NOT NULL,
    gift_id INT NOT NULL
)

CREATE TABLE suggest (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    content VARCHAR(255) NOT NULL,
    tags VARCHAR(255),
    addDate DATETIME DEFAULT CURRENT_TIMESTAMP,
	name VARCHAR(255) NOT NULL,
    photoPath VARCHAR(255)
)

CREATE TABLE users ( 
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY, 
    nickname VARCHAR(255) NOT NULL, 
    imgPath VARCHAR(255), 
    role INT NOT NULL, 
    email VARCHAR(255) NOT NULL 
)

-- изменил так как забыл добавить
ALTER TABLE users
ADD COLUMN bio VARCHAR(255),
ADD COLUMN tags VARCHAR(255);


-- временное решение
CREATE TABLE tags (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    text VARCHAR(255) NOT NULL
)

-- чёрный список
CREATE TABLE blacklist (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    addDate DATETIME DEFAULT CURRENT_TIMESTAMP
)

-- админский список
CREATE TABLE admins (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    addDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    admin_level INT NOT NULL DEFAULT 1
)

-- тестовые данные
INSERT INTO admins (user_id, admin_level) VALUES (1, 2)

-- таблица рейтингов
CREATE TABLE reating (
	id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    gift_id INT NOT NULL,
    mark INT NOT NULL
)
