CREATE DATABASE privatecloud;
CREATE USER 'testuser'@'localhost' IDENTIFIED BY 'huso';
GRANT ALL PRIVILEGES ON privatecloud.* TO 'testuser'@'localhost';
FLUSH PRIVILEGES;
USE privatecloud;

CREATE TABLE pics (
    pic_id INT AUTO_INCREMENT PRIMARY KEY,
    pic_path VARCHAR(255) NOT NULL
);

INSERT INTO pics (pic_path) VALUES
('testdata/1.png'), 
('testdata/2.png'), 
('testdata/3.png'), 
('testdata/4.png');


