CREATE TABLE users (
	useId INT AUTO_INCREMENT PRIMARY KEY,
	useName VARCHAR(100) NOT NULL,
	useLogin VARCHAR(100) NOT NULL, 
	usePassword VARCHAR(255) NOT NULL, 
	useStatus INT NOT NULL,
	usePhone varchar(60),
	createdAt TIMESTAMP, 
	updatedAt TIMESTAMP
);
--- estados 1 activo 2 inactivo 3 cuenta sin validar
-- SELECT distinct(menId), menName, menIco
-- FROM menu 
-- INNER JOIN processes
-- 	ON processes.menIdFk = menu.menId
-- INNER JOIN rolesProcesses
-- 	ON rolesProcesses.proIdFk = processes.proId
-- INNER JOIN usersRoles
--  	ON usersRoles.rolIdFK  = rolesProcesses.rolIdFk
--  WHERE usersRoles.useIdFk = 4

CREATE TABLE roles (
	rolId INT AUTO_INCREMENT PRIMARY KEY,
	rolName VARCHAR(100) NOT NULL,
	createdAt  TIMESTAMP, 
	updatedAt TIMESTAMP
);

CREATE TABLE menu (
	menId INT AUTO_INCREMENT PRIMARY KEY,
	menName VARCHAR(200) NOT NULL,
	menIco VARCHAR(60) NOT NULL,
	createdAt  TIMESTAMP, 
	updatedAt TIMESTAMP
);

CREATE TABLE processes (
	proId INT AUTO_INCREMENT PRIMARY KEY,
	proName VARCHAR(100) NOT NULL,
	proUrl VARCHAR(255) NOT NULL,
	menIdFk INT,
	createdAt  TIMESTAMP, 
	updatedAt TIMESTAMP,
	FOREIGN KEY (menIdFk) REFERENCES menu(menId)
);


CREATE TABLE rolesProcesses (
	rolIdFk INT NOT NULL,
	proIdFk INT NOT NULL,
	createdAt  TIMESTAMP, 
	updatedAt TIMESTAMP,
	FOREIGN KEY (rolIdFk) REFERENCES roles(rolId),
	FOREIGN KEY (proIdFk) REFERENCES processes(proId)
);

---- sin crear por el momento
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
	updatedAt TIMESTAMP,
	FOREIGN KEY (rolIdFk) REFERENCES roles(rolId),
	FOREIGN KEY (useIdFk) REFERENCES users(useId)
);

------------------------------------------------------------------------
CREATE TABLE business (
	busId INT AUTO_INCREMENT PRIMARY KEY,
	busName VARCHAR(100) NOT NULL,
	busJuriricalId VARCHAR(100) NOT NULL,
	busNameFantasy VARCHAR(100) NOT NULL,
	busMoney INT NOT NULL, 
	useIdFk INT NOT NULL, 
	busStatus INT NOT NULL,
	busEmail VARCHAR(60), 
	busPhone VARCHAR(60),
	createdAt  TIMESTAMP, 
	updatedAt TIMESTAMP
);

-- permitId 1 consultar, permitId 1 modificar

CREATE TABLE businessUsersPermit (
	bupId INT AUTO_INCREMENT PRIMARY KEY,
	busIdFk INT NOT NULL,
	useIdFk INT NOT NULL,
	useIdFkOwner INT NOT NULL, 
	accIdFk INT NOT NULL,
	permitId INT NOT NULL,
	createdAt  TIMESTAMP, 
	updatedAt TIMESTAMP
);

CREATE TABLE businessAccountingC (
	busIdFk INT NOT NULL,
	accIdFk INT NOT NULL,
	createdAt  TIMESTAMP, 
	updatedAt TIMESTAMP
);

----------------------------------------------------------------------

CREATE TABLE accountingCatalog (
	accId INT AUTO_INCREMENT PRIMARY KEY,
	accName VARCHAR(100) NOT NULL,
	accCode VARCHAR(4) NOT NULL,
	accIsGlobal INT NOT NULL,
	accQuantityNivels INT NOT NULL,
	accNivels VARCHAR(500), 
	accStatus INT NOT NULL,
	accSeparator VARCHAR(2), 
	useIdFk INT NOT NULL,
	createdAt  TIMESTAMP,
	updatedAt TIMESTAMP
);


CREATE TABLE definedAccountingCatalog (
	accIdFk INT NOT NULL,
	busIdFk INT NOT NULL,
	useIdFk INT NOT NULL,
	createdAt  TIMESTAMP,
	updatedAt TIMESTAMP
);

---  Datos iniciando segunda programacion 
CREATE TABLE definedAccCatMonth (
	accIdFk INT NOT NULL,
	busIdFk INT NOT NULL,
	useIdFk INT NOT NULL,
	month INT NOT NULL,
	year INT NOT NULL,
	createdAt  TIMESTAMP,
	updatedAt TIMESTAMP
);

--- accType 1 Activo, 2 Pasivo, 3 Patrimonio, 4 Ingresos, 5 Costos Ventas, 6 Gastos, 7 Costos Producción   
-- accTypeBalance 1 Deudor 2 Acreedor

CREATE TABLE accountingAccount(
	aacId INT AUTO_INCREMENT PRIMARY KEY,
	accIdFk INT NOT NULL,
	busIdFk INT NOT NULL,
	useIdFk INT NOT NULL,
	aacCode VARCHAR(255) NOT NULL,
	aacName VARCHAR(255) NOT NULL,
	aacType INT NOT NULL,
	aacTypeBalance INT NOT NULL,
	aacFuncionality VARCHAR(555) NOT NULL,
	aacObservations VARCHAR(555) NOT NULL,
	aacStatus INT NOT NULL,
	aacMoney INT NOT NULL,
	aacNivels VARCHAR(500), 
	createdAt  TIMESTAMP,
	updatedAt TIMESTAMP
);

CREATE TABLE deleteAccountingAccount(
	daaId INT AUTO_INCREMENT PRIMARY KEY,
	accIdFk INT NOT NULL,
	busIdFk INT NOT NULL,
	useIdFk INT NOT NULL,
	aacCode VARCHAR(255) NOT NULL,
	aacName VARCHAR(255) NOT NULL,
	createdAt  TIMESTAMP,
	updatedAt TIMESTAMP
);