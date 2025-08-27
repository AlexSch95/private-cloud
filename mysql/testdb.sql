CREATE DATABASE privatecloud;
CREATE USER 'testuser'@'localhost' IDENTIFIED BY 'huso';
GRANT ALL PRIVILEGES ON privatecloud.* TO 'testuser'@'localhost';
FLUSH PRIVILEGES;
USE privatecloud;

CREATE TABLE pics (
    pic_id INT AUTO_INCREMENT PRIMARY KEY,
    pic_path VARCHAR(255) NOT NULL
);


