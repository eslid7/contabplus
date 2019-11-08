CREATE TABLE users (
	useId INT AUTO_INCREMENT PRIMARY KEY,
	useName VARCHAR(100) NOT NULL,
	useLogin VARCHAR(100) NOT NULL, 
	usePassword VARCHAR(255) NOT NULL, 
	useStatus INT NOT NULL,
	userPhone varchar(60),
	createdAt  TIMESTAMP, 
	updatedAt TIMESTAMP
);


CREATE TABLE roles (
	rolId INT AUTO_INCREMENT PRIMARY KEY,
	rolName VARCHAR(100) NOT NULL,
	createdAt  TIMESTAMP, 
	updatedAt TIMESTAMP
);


CREATE TABLE processes (
	proId INT AUTO_INCREMENT PRIMARY KEY,
	proName VARCHAR(100) NOT NULL,
	proUrl VARCHAR(255) NOT NULL,
	createdAt  TIMESTAMP, 
	updatedAt TIMESTAMP
);


CREATE TABLE rolesProcesses (
	rolIdFk INT NOT NULL,
	proIdFk INT NOT NULL,
	createdAt  TIMESTAMP, 
	updatedAt TIMESTAMP
);


CREATE TABLE userspermissions (
	useId INT NOT NULL,
	proId INT NOT NULL,
	createdAt  TIMESTAMP, 
	updatedAt TIMESTAMP
);


CREATE TABLE usersRoles (
	useIdFk INT NOT NULL,
	rolIdFK INT NOT NULL,
	createdAt  TIMESTAMP, 
	updatedAt TIMESTAMP
);

CREATE TABLE business (
	busId INT AUTO_INCREMENT PRIMARY KEY,
	busName VARCHAR(100) NOT NULL,
	useIdFk INT NOT NULL, 
	busStatus INT NOT NULL,
	busEmail VARCHAR(60), 
	busPhone VARCHAR(60),
	createdAt  TIMESTAMP, 
	updatedAt TIMESTAMP
);

CREATE TABLE businessUsers (
	busIdFk INT NOT NULL,
	useIdFk INT NOT NULL,
	createdAt  TIMESTAMP, 
	updatedAt TIMESTAMP
);

