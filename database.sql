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