CREATE DATABASE IF NOT EXISTS machinezr_portfolio;
USE machinezr_portfolio;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    images TEXT,
    githubLink VARCHAR(255),
    readmeLink VARCHAR(255),
    status VARCHAR(50),
    techstack TEXT
);