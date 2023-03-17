-- drop test database of it exist
DROP DATABASE IF EXISTS `starchart_test`;

-- create regular and test databases
CREATE DATABASE IF NOT EXISTS `startchart`;
CREATE DATABASE IF NOT EXISTS `starchart_test`;

-- create root user and grant rights
CREATE USER 'root'@'localhost' IDENTIFIED BY 'root_password';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';
