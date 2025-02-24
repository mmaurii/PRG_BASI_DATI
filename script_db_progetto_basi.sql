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

/* DEFINIZIONE DELLE STORED PROCEDURE */

/* creo una procedura per l'Autenticazione sulla piattaforma */
drop PROCEDURE if exists logIn;
DELIMITER |
CREATE PROCEDURE logIn (IN inputMail varchar(255), IN inputPassword varchar(255), OUT isLogIn bool)  
BEGIN
	if exists(select mail, password
				FROM utente
				WHERE (mail=inputMail) AND (password=inputPassword)) then
		set isLogIn = true;
    else
		set isLogIn = false;
    end if;
END;
|
DELIMITER ;

/* creo una procedura per la registrazione sulla piattaforma */
drop PROCEDURE if exists singUp;
DELIMITER |
CREATE PROCEDURE singUp (IN inputMail varchar(255),IN inputNickname varchar(255), IN inputPassword varchar(255), IN inputNome varchar(255), IN inputCognome varchar(255), IN inputAnnoN YEAR, IN inputLuogo varchar(255), OUT isSingUp bool) 
BEGIN
	if exists(select mail, password
				FROM utente
				WHERE (mail=inputMail)) then
		set isSingUp = false;
    else
		insert into utente (mail, nickname, password, nome, cognome, annoN, luogo)
        values (inputMail, inputNickname, inputPassword, inputNome, inputCognome, inputAnnoN, inputLuogo);
		set isSingUp = true;
    end if;
END;
|
DELIMITER ;

/* creo una procedura per l'inserimento delle proprie skills di curriculum */
drop PROCEDURE if exists setLivelloCompetenza;
DELIMITER |
CREATE PROCEDURE setLivelloCompetenza (IN inputLivello int, IN inputCompetenza VARCHAR(255), IN inputMail varchar(255), OUT isSet bool) 
BEGIN
	if (inputLivello>=0 and inputLivello <=5) then
		insert into possiede (mail, competenza, livello)
        values (inputMail, inputCompetenza, inputLivello);
		set isSet = true;
    else
		set isSet = false;
    end if;
END;
|
DELIMITER ;

/* creo una procedura per la visualizzazione dei progetti disponibili */
drop PROCEDURE if exists getProgetti;
DELIMITER |
CREATE PROCEDURE getProgetti () 
BEGIN
	select *
    from progetti
    where stato = 'aperto';
END;
|
DELIMITER ;

/* creo una procedura per il finanziamento di un progetto (aperto). Un utente può finanziare anche il progetto di cui è creatore. */
drop PROCEDURE if exists finanziaProgetto;
DELIMITER |
CREATE PROCEDURE finanziaProgetto(IN imnputMail VARCHAR(255), IN imnputNome VARCHAR(255),IN imnputData DATE, IN imnputImporto int, IN inputCodR VARCHAR(255)) 
BEGIN
	if not exists(select * from progetto where (nome = inputNome) and (stato = 'aperto')) then
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'inputNome doesn\'t exists or is not an open project';
    END IF;
        
	insert into finanziamento (mail, nome, data, importo, codR)
	values (imnputMail, imnputNome, imnputData, imnputImporto, inputCodR);
END;
|
DELIMITER ;

/* creo una procedura per scegliere la reward a valle del finanziamento di un progetto. */
drop PROCEDURE if exists choseReward;
DELIMITER |
CREATE PROCEDURE choseReward(IN imnputMail VARCHAR(255), IN imnputNome VARCHAR(255),IN imnputData DATE, IN inputCodR VARCHAR(255)) 
BEGIN
	if (inputCodR is null) then
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'inputCodR cannot be null';
    END IF;

	if not exists(select * from progetto where nome = inputNome) then
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'inputNome doesn\'t exists';
    END IF;
    
	if not exists(select * from reward where (cod = inputCodR) and (nomeP = inputNome)) then
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'inputCodR doesn\'t exists';
    END IF;
    
	update finanziamento 
	set codR=inputCodR
    where (mail = imnputMail) and (nome = imnputNome) and (data = inputData);
END;
|
DELIMITER ;

/* DEFINIZIONE DELLE VIEW */

/* Visualizzare la classifica degli utenti creatori, in base al loro valore di affidabilità. Mostrare solo il nickname dei primi 3 utenti. */
DROP VIEW if exists viewClassifica;
CREATE VIEW viewClassifica(mail, affidabilita) AS
	SELECT mail, affidabilita
	FROM creatore
	order by affidabilita desc
    limit 3;

/* DEFINIZIONE DEI TRIGGER */

/* triggers per aggiornare l’affidabilità di un utente creatore. L’affidabilità viene calcolata come X è la percentuale di progetti creati dall’utente che hanno ottenuto almeno un finanziamento */
/* condizione: ogni qualvolta un utente crea un progetto*/

DROP TRIGGER if exists aggiornaAffidabilitaOnProgetto;
DELIMITER |
CREATE TRIGGER aggiornaAffidabilitaOnProgetto 
after INSERT ON progetto
FOR EACH ROW
BEGIN
	DECLARE numProgetti INT DEFAULT 0;
	DECLARE numProgettiFinanziati INT DEFAULT 0;
	/* Recupero il numero attuale di progetti dell'utente*/
	select nr_progetti from creatore where mail=new.mailC INTO numProgetti;

	/* Recupero il numero attuale di progetti finanziati*/
	select count(*) from finanziamento where nome=new.nome INTO numProgettiFinanziati;
    
	IF numProgetti > 0 THEN
		UPDATE creatore SET affidabilita = numProgetti/numProgettiFinanziati WHERE (mail=NEW.mailC);
	END IF;
END;
|
DELIMITER ;

/* condizione: ogni qualvolta un progetto dell’utente riceve un finanziamento */
DROP TRIGGER if exists aggiornaAffidabilitaOnFinanziamento;
DELIMITER |
CREATE TRIGGER aggiornaAffidabilitaOnFinanziamento 
after insert on finanziamento 
FOR EACH ROW
BEGIN
	DECLARE numProgetti INT DEFAULT 0;
	DECLARE numProgettiFinanziati INT DEFAULT 0;
	/* Recupero il numero attuale di progetti dell'utente*/
	select c.nr_progetti from creatore c where c.mail in (select p.mail from progetto p where p.nome=new.nome) INTO numProgetti;

	/* Recupero il numero attuale di progetti finanziati*/
	select count(*) from finanziamento where nome=new.nome INTO numProgettiFinanziati;
    
	IF numProgetti > 0 THEN
		UPDATE creatore SET affidabilita = numProgetti/numProgettiFinanziati WHERE c.mail in (select p.mail from progetto p where p.nome=new.nome);
	END IF;
END;
|
DELIMITER ;
