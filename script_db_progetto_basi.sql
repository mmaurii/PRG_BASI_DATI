drop database if exists BOSTARTER;
create database BOSTARTER;
use BOSTARTER;

create table UTENTE(
	mail varchar(255) primary key,
    nickname varchar(255),
    password varchar(255),
    nome varchar(255),
    cognome varchar(255),
    annoN YEAR,
    luogo varchar(255)
)engine= innodb;

CREATE TABLE SKILL (
    competenza VARCHAR(255) PRIMARY KEY
)engine= innodb;

CREATE TABLE CREATORE (
    mail VARCHAR(255) PRIMARY KEY,
    nr_progetti INT,
    affidabilita FLOAT,
    FOREIGN KEY (mail) REFERENCES UTENTE(mail)
)engine= innodb;

CREATE TABLE ADMIN (
    mail VARCHAR(255) PRIMARY KEY,
    codSicurezza VARCHAR(255) not null,
    FOREIGN KEY (mail) REFERENCES UTENTE(mail)
)engine= innodb;

CREATE TABLE PROGETTO (
    nome VARCHAR(255) PRIMARY KEY,
    descrizione text,
    dataInserimento DATE,
    budget int,
    dataLimite DATE,
    stato ENUM('aperto', 'chiuso'),
    mailC VARCHAR(255) not null,
    tipo VARCHAR(100),
    FOREIGN KEY (mailC) REFERENCES CREATORE(mail)
)engine= innodb;

CREATE TABLE FOTO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    foto BLOB,
    nomeP VARCHAR(255) not null,
    FOREIGN KEY (nomeP) REFERENCES PROGETTO(nome)
)engine= innodb;

CREATE TABLE COMMENTO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data DATE,
    testo text,
    risposta text,
    mail VARCHAR(255) not null,
    nome VARCHAR(255) not null,
    FOREIGN KEY (mail) REFERENCES UTENTE(mail),
    FOREIGN KEY (nome) REFERENCES PROGETTO(nome)
)engine= innodb;

CREATE TABLE COMPONENTE (
    nomeC VARCHAR(255) PRIMARY KEY,
    descrizione text,
    prezzo int,
    qt INT CHECK (qt > 0)
)engine= innodb;

CREATE TABLE REWARD (
    cod VARCHAR(255) PRIMARY KEY,
    foto BLOB,
    descrizione text,
    nomeP VARCHAR(255) not null,
    FOREIGN KEY (nomeP) REFERENCES PROGETTO(nome)
)engine= innodb;

CREATE TABLE FINANZIAMENTO (
    mail VARCHAR(255),
    nome VARCHAR(255),
    data DATE,
    importo int,
    codR VARCHAR(255) not null,
    PRIMARY KEY (mail, nome, data),
    FOREIGN KEY (mail) REFERENCES UTENTE(mail),
    FOREIGN KEY (nome) REFERENCES PROGETTO(nome),
    FOREIGN KEY (codR) REFERENCES REWARD(cod)
)engine= innodb;

CREATE TABLE POSSIEDE (
    mail VARCHAR(255),
    competenza VARCHAR(255),
    livello TINYINT,
    CHECK (livello >= 0 AND livello <= 5),
    PRIMARY KEY (mail, competenza),
    FOREIGN KEY (mail) REFERENCES UTENTE(mail),
    FOREIGN KEY (competenza) REFERENCES SKILL(competenza)
)engine= innodb;

CREATE TABLE PROFILO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255),
    nomeS VARCHAR(255) not null,
    FOREIGN KEY (nomeS) REFERENCES PROGETTO(nome)
)engine= innodb;

CREATE TABLE S_P (
    competenza VARCHAR(255),
    idProfilo INT,
    livello TINYINT,
	CHECK (livello >= 0 AND livello <= 5),
    PRIMARY KEY (competenza, idProfilo),
    FOREIGN KEY (competenza) REFERENCES SKILL(competenza),
    FOREIGN KEY (idProfilo) REFERENCES PROFILO(id)
)engine= innodb;

CREATE TABLE COMPOSTO (
    nomeC VARCHAR(255),
    nomeH VARCHAR(255),
    PRIMARY KEY (nomeC, nomeH),
    FOREIGN KEY (nomeC) REFERENCES COMPONENTE(nomeC),
    FOREIGN KEY (nomeH) REFERENCES PROGETTO(nome)
)engine= innodb;

CREATE TABLE CANDIDATURA (
    mail VARCHAR(255),
    id INT,
    stato VARCHAR(50),
    PRIMARY KEY (mail, id),
    FOREIGN KEY (mail) REFERENCES UTENTE(mail),
    FOREIGN KEY (id) REFERENCES PROFILO(id)
)engine= innodb;

DESCRIBE SKILL;
DESCRIBE COMMENTO;
DESCRIBE CREATORE;
DESCRIBE ADMIN;
DESCRIBE FOTO;
DESCRIBE PROGETTO;
DESCRIBE COMPONENTE;
DESCRIBE PROFILO;
DESCRIBE REWARD;
DESCRIBE FINANZIAMENTO;
DESCRIBE POSSIEDE;
DESCRIBE S_P;
DESCRIBE COMPOSTO;
DESCRIBE CANDIDATURA;

SELECT User, Host FROM mysql.user;

