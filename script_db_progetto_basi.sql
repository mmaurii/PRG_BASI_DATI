drop database if exists BOSTARTER;
create database BOSTARTER;
use BOSTARTER;

/*definizione schema db*/

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
    nr_progetti INT DEFAULT 0,
    affidabilita FLOAT DEFAULT 0,
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
    stato ENUM('aperto', 'chiuso') default 'aperto',
    mailC VARCHAR(255) not null,
    tipo ENUM('Hardware', 'Software'),
    FOREIGN KEY (mailC) REFERENCES CREATORE(mail)
)engine= innodb;

CREATE TABLE FOTO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    foto varchar(255),
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
    cod INT AUTO_INCREMENT PRIMARY KEY,
    foto varchar(255),
    descrizione text,
    nomeP VARCHAR(255) not null,
    FOREIGN KEY (nomeP) REFERENCES PROGETTO(nome)
)engine= innodb;

CREATE TABLE FINANZIAMENTO (
    mail VARCHAR(255),
    nome VARCHAR(255),
    dataF DATE,
    importo int,
    PRIMARY KEY (mail, nome, dataF),
    FOREIGN KEY (mail) REFERENCES UTENTE(mail),
    FOREIGN KEY (nome) REFERENCES PROGETTO(nome)
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

CREATE TABLE F_R (
    mail VARCHAR(255),
    nome VARCHAR(255),
    dataF DATE,
    codR INT,
	PRIMARY KEY (mail, nome, dataF, codR),
    FOREIGN KEY (mail, nome, dataF) REFERENCES FINANZIAMENTO(mail, nome, dataF),
    FOREIGN KEY (codR) REFERENCES REWARD(cod)
)engine= innodb;

SELECT User, Host FROM mysql.user;

/* DEFINIZIONE DELLE STORED PROCEDURE */

/* creo una procedura per l'Autenticazione sulla piattaforma */
drop PROCEDURE if exists logIn;
DELIMITER |
CREATE PROCEDURE logIn (IN inputMail varchar(255), IN inputPassword varchar(255), OUT isLogIn bool)  
BEGIN
	if exists(select mail, password
				FROM UTENTE
				WHERE (mail=inputMail) AND (password=inputPassword)) then
		set isLogIn = true;
    else
		set isLogIn = false;
    end if;
END;
|
DELIMITER ;

/* creo una procedura per la registrazione sulla piattaforma */
drop PROCEDURE if exists signUp;
DELIMITER |
CREATE PROCEDURE signUp (IN inputMail varchar(255),IN inputNickname varchar(255), IN inputPassword varchar(255), IN inputNome varchar(255), IN inputCognome varchar(255), IN inputAnnoN YEAR, IN inputLuogo varchar(255), inputRole varchar(7), inputSecureCode varchar(255), OUT isSignUp bool) 
BEGIN
	if exists(select mail, password
				FROM UTENTE
				WHERE (mail=inputMail)) then
		set isSignUp = false;
    else
        if(inputRole is not null) then
            START TRANSACTION;
            if(inputRole = 'user' or inputRole = 'creator' or inputRole = 'admin') then
                insert into UTENTE (mail, nickname, password, nome, cognome, annoN, luogo)
                values (inputMail, inputNickname, inputPassword, inputNome, inputCognome, inputAnnoN, inputLuogo);
                set isSignUp = true;
            end if;
            if(inputRole = 'creator') then
                insert into CREATORE (mail)
                values (inputMail);
                set isSignUp = true;
            end if;
            if(inputRole = 'admin') then
                insert into ADMIN (mail, codSicurezza)
                values (inputMail, inputSecureCode);
                set isSignUp = true;
            end if;

            if(isSignUp = false) then
                ROLLBACK;
            else
                COMMIT;
            end if;
        else
            set isSignUp = false;
        end if;
    end if;
END;
|
DELIMITER ;

/* creo una procedura per l'inserimento delle proprie skills di curriculum */
drop PROCEDURE if exists setLivelloCompetenza;
DELIMITER |
CREATE PROCEDURE setLivelloCompetenza (IN inputLivello int, IN inputCompetenza VARCHAR(255), IN inputMail varchar(255), OUT isSet bool) 
BEGIN
	set isSet = false;
	if (inputLivello>=0 and inputLivello <=5) then
		insert into POSSIEDE (mail, competenza, livello)
        values (inputMail, inputCompetenza, inputLivello);
		set isSet = true;
    end if;
END;
|
DELIMITER ;

/* creo una procedura per la richiesta dei progetti disponibili */
drop PROCEDURE if exists getProgetti;
DELIMITER |
CREATE PROCEDURE getProgetti () 
BEGIN
	select *
    from PROGETTO
    where stato = 'aperto';
END;
|
DELIMITER ;

/* creo una procedura per la richiesta delle rewards associate a un progetto */
drop PROCEDURE if exists getReWards;
DELIMITER |
CREATE PROCEDURE getReWards (inputNome VARCHAR(255)) 
BEGIN
    if(inputNome is null) then
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'inputNome cannot be null';
    else
        select *
        from REWARD
        where nomeP = inputNome;
    end if;
END;
|
DELIMITER ;

/* creo una procedura che selezioni tutti i finanziamenti di un utente che non hanno una reward associata */
drop PROCEDURE if exists getFinanziamenti;
DELIMITER |
CREATE PROCEDURE getFinanziamenti (inputMail VARCHAR(255))
BEGIN
    if(inputMail is null) then
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'inputMail cannot be null';
    else
        select F.mail, F.nome, F.dataF, F.importo
        from FINANZIAMENTO F
        where F.mail = inputMail and not exists(select 1 from F_R where (F.mail = mail) and (F.nome = nome) and (F.dataF = dataF));
    end if;
END;
|
DELIMITER ;

/* creo una procedura per il finanziamento di un progetto (aperto). Un utente può finanziare anche il progetto di cui è creatore. */
drop PROCEDURE if exists finanziaProgetto;
DELIMITER |
CREATE PROCEDURE finanziaProgetto(IN inputMail VARCHAR(255), IN inputNome VARCHAR(255),IN inputData DATE, IN inputImporto int, IN inputCodR VARCHAR(255))
BEGIN
	if not exists(select * from PROGETTO where (nome = inputNome) and (stato = 'aperto')) then
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'inputNome doesn\'t exists or is not an open project';
    END IF;
        
	insert into FINANZIAMENTO (mail, nome, dataF, importo)
	values (inputMail, inputNome, inputData, inputImporto);
        
	if (inputCodR <> '') then
		call chooseReward(inputMail, inputNome, inputData, inputCodR);
	END IF;
END;
|
DELIMITER ;

/* creo una procedura per scegliere la reward a valle del finanziamento di un progetto. */
drop PROCEDURE if exists chooseReward;
DELIMITER |
CREATE PROCEDURE chooseReward(IN inputMail VARCHAR(255), IN inputNome VARCHAR(255),IN inputData DATE, IN inputCodR VARCHAR(255))
BEGIN
	if (inputCodR is null) then
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'inputCodR cannot be null';
    END IF;

	if exists(select 1 from FINANZIAMENTO F JOIN REWARD R ON (F.nome = R.nomeP) 
				where (F.nome=inputNome and F.mail=inputMail and F.dataF = inputData and R.cod = inputCodR )) then
		insert into F_R (mail, nome, dataF, codR)
		values (inputMail, inputNome, inputData, inputCodR);
    else
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'invalid input parameter';
    END IF;
END;
|
DELIMITER ;

/*d*/
/* creo una procedura per l'aggiunta delle reward per un progetto */
drop PROCEDURE if exists addReward;
DELIMITER |
CREATE PROCEDURE addReward (IN inputFoto varchar(255), IN inputDescrizione text, IN inputNomeP VARCHAR(255))  
BEGIN
    IF (inputNomeP IS NULL) THEN
		SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Errore: nomeP non può essere NULL';
	END IF;
    
	if not exists(select * FROM PROGETTO WHERE nome=inputNomeP) then
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Errore: nomeP non esiste come progetto';
    end if;
    
    INSERT INTO REWARD (foto, descrizione, nomeP) 
    VALUES (inputFoto, inputDescrizione, inputNomeP);
END;
|
DELIMITER ;

/* Inserimento di un commento relativo ad un progetto */
DROP PROCEDURE IF EXISTS addComment;
DELIMITER |
CREATE PROCEDURE addComment(IN inputMail VARCHAR(255), IN inputNomeProgetto VARCHAR(255), IN inputTesto TEXT, IN inputData DATE, OUT outputId INT)
BEGIN
    if not exists(select * from PROGETTO where nome = inputNomeProgetto) then
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'inputNome doesn\'t exists';
    END IF;
    insert into COMMENTO (data, testo, mail, nome)
	values (inputData, inputTesto, inputMail, inputNomeProgetto);
    SET outputId = LAST_INSERT_ID();
END;
|
DELIMITER ;


/* Inserimento di una candidatura per un profilo richiesto per la realizzazione di un progetto software */
DROP PROCEDURE IF EXISTS InserisciCandidatura;
DELIMITER |
CREATE PROCEDURE InserisciCandidatura(IN inputMail VARCHAR(255), IN inputId INT, IN inputStato VARCHAR(50))
BEGIN
    if not exists(select * from profilo where id = inputId) then
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'inputId doesn\'t exists';
    END IF;
    insert into candidatura (mail, id, stato)
	values (inputMail, inputId, inputStato);
END;
|
DELIMITER ;


/* Inserimento di una nuova stringa nella lista delle competenze */
DROP PROCEDURE IF EXISTS InserisciCompetenza;
DELIMITER |
CREATE PROCEDURE InserisciCompetenza(IN inputCompetenza VARCHAR(255))
BEGIN
    if exists(select * from SKILL where competenza = inputCompetenza) then
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'inputId alredy exists';
    END IF;
    insert into SKILL (competenza)
	values (inputCompetenza);
END;
|
DELIMITER ;

/* Ottenere le varie competenze */
DROP PROCEDURE IF EXISTS getCompetenze;
DELIMITER |
CREATE PROCEDURE getCompetenze(inputMail VARCHAR(255))
BEGIN
    if(inputMail ='') then
        SELECT competenza FROM SKILL;
    else
        SELECT * FROM POSSIEDE WHERE mail = inputMail;
    end if;
END;
|
DELIMITER ;

/* In fase di autenticazione, oltre a username e password, viene richiesto anche il codice di sicurezza */
DROP PROCEDURE IF EXISTS logInAdmin;
DELIMITER |
CREATE PROCEDURE logInAdmin (IN inputMail VARCHAR(255), IN inputPassword VARCHAR(255), IN inputCodSicurezza VARCHAR(255), OUT isLogIn BOOL)  
BEGIN
    IF EXISTS (
        SELECT A.mail
        FROM ADMIN A
        JOIN UTENTE U ON A.mail = U.mail
        WHERE A.mail = inputMail 
              AND U.password = inputPassword 
              AND A.codSicurezza = inputCodSicurezza
    ) THEN
        SET isLogIn = TRUE;
    ELSE
        SET isLogIn = FALSE;
    END IF;
END;
|
DELIMITER ;

/* Inserimento di un nuovo progetto */
DROP PROCEDURE IF EXISTS InserisciProgetto;
DELIMITER |
CREATE PROCEDURE InserisciProgetto(inputNome VARCHAR(255), inputDescrizione text, inputDataInserimento DATE, inputBudget int, inputDataLimite DATE, inputStato ENUM('aperto', 'chiuso'), inputMailC VARCHAR(255), inputTipo ENUM('Hardware', 'Software'))
BEGIN
    if exists(select * from PROGETTO where nome = inputNome) then
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'name project alredy exists';
    END IF;
    insert into PROGETTO (nome, descrizione, dataInserimento, budget, dataLimite, stato, mailC, tipo)
	values (inputNome, inputDescrizione, inputDataInserimento, inputBudget, inputDataLimite, inputStato, inputMailC, inputTipo);
END;
|
DELIMITER ;

/* creo una procedura per l'aggiunta di una risposta ad un commento */
drop PROCEDURE if exists addResponseToComment;
DELIMITER |
CREATE PROCEDURE addResponseToComment(IN inputId INT, IN inputRisposta TEXT)
BEGIN
	IF not EXISTS (SELECT * FROM COMMENTO WHERE id = inputId AND risposta IS NULL) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Commento non trovato o risposta già presente';
    END IF;
    
	UPDATE COMMENTO
    SET risposta = inputRisposta
    WHERE id = inputId;
END;
|
DELIMITER ;

DROP PROCEDURE IF EXISTS addProfileForProjectSoft;
DELIMITER |
CREATE PROCEDURE addProfileForProjectSoft(
    IN inputNome VARCHAR(255), 
    IN inputNomeS VARCHAR(255),
    OUT outputProfileID INT
)
BEGIN
    -- Controlla se il progetto esiste
    IF NOT EXISTS (SELECT 1 FROM PROGETTO WHERE nome = inputNomeS) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Errore: Il progetto non esiste.';
    END IF;

    -- Controlla se il progetto è di tipo 'Software'
    IF NOT EXISTS (SELECT 1 FROM PROGETTO WHERE nome = inputNomeS AND tipo = 'Software') THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Errore: Il progetto esiste, ma non è di tipo Software.';
    END IF;

    -- Inserisci il nuovo profilo nella tabella PROFILO
    INSERT INTO PROFILO (nome, nomeS) 
    VALUES (inputNome, inputNomeS);

    -- Recupera l'ID del nuovo profilo inserito
    SET outputProfileID = LAST_INSERT_ID(); -- Ottieni l'ID dell'ultimo inserimento

END;
|
DELIMITER ;



/* creo una procedura per gestire l'accettazione di una candidatura */
drop PROCEDURE if exists manageApplicationStatus ;
DELIMITER |
CREATE PROCEDURE manageApplicationStatus(IN inputMail VARCHAR(255), IN inputId INT, IN inputStato VARCHAR(50))
BEGIN
	 IF not EXISTS (SELECT * FROM CANDIDATURA WHERE mail = inputMail AND id = inputId) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Candidatura non trovata';
    END IF;
    
    UPDATE CANDIDATURA
	SET stato = inputStato
	WHERE mail = inputMail AND id = inputId;
END;
|
DELIMITER ;

/*Procedure di appoggio*/
/*ottenere il ruolo dell'utente, se admin, amministratore, entrambi o nessuno dei due*/
DROP PROCEDURE IF EXISTS getUserRole;
DELIMITER |
CREATE PROCEDURE getUserRole(IN user_mail VARCHAR(255), OUT user_role VARCHAR(50))
BEGIN
	IF NOT EXISTS (SELECT 1 FROM UTENTE WHERE mail = user_mail) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'L\'utente non esiste nel sistema';
    END IF;
    
    SELECT 
        CASE 
            WHEN a.mail IS NOT NULL AND c.mail IS NOT NULL THEN 'admin_creator'
            WHEN a.mail IS NOT NULL THEN 'admin'
            WHEN c.mail IS NOT NULL THEN 'creator'
            ELSE 'user'
        END INTO user_role
    FROM UTENTE u
    LEFT JOIN ADMIN a ON u.mail = a.mail
    LEFT JOIN CREATORE c ON u.mail = c.mail
    WHERE u.mail = user_mail;
END 
|
DELIMITER ;

/*restituisce i dati del progetto*/
DROP PROCEDURE IF EXISTS getProjectByName;
DELIMITER |
CREATE PROCEDURE getProjectByName(IN projectName VARCHAR(255))
BEGIN
    SELECT * FROM PROGETTO WHERE nome = projectName;
END
|
DELIMITER ;

/*restituisce le foto del progetto*/
DROP PROCEDURE IF EXISTS getFotoByProgetto;
DELIMITER |
CREATE PROCEDURE getFotoByProgetto(IN progettoNome VARCHAR(255))
BEGIN
    SELECT foto 
    FROM FOTO 
    WHERE nomeP = progettoNome;
END
|
DELIMITER ;

DROP PROCEDURE IF EXISTS getCommentsByProgetto;
DELIMITER |
CREATE PROCEDURE getCommentsByProgetto(IN nome_progetto VARCHAR(255))
BEGIN
    SELECT 
		id,
        testo,
        data,
        risposta,
        mail,
        nome
    FROM 
        COMMENTO
    WHERE 
        nome = nome_progetto;
END 
|
DELIMITER ;


DROP PROCEDURE IF EXISTS getProfiliByProgetto;
DELIMITER |
CREATE PROCEDURE getProfiliByProgetto(IN progettoNome VARCHAR(255))
BEGIN
    SELECT * FROM PROFILO WHERE nomeS = progettoNome;
END
|
DELIMITER ;

DROP PROCEDURE IF EXISTS getCompetenzeByProfile;
DELIMITER |
CREATE PROCEDURE getCompetenzeByProfile(IN p_idProfilo INT)
BEGIN
    SELECT competenza, livello
    FROM S_P
    WHERE idProfilo = p_idProfilo;
END
|
DELIMITER ;

DROP PROCEDURE IF EXISTS popola_s_p;
DELIMITER |
CREATE PROCEDURE popola_s_p(IN p_competenza VARCHAR(255), IN p_idProfilo INT, IN p_livello TINYINT)
BEGIN
    IF p_livello < 0 OR p_livello > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Il livello deve essere compreso tra 0 e 5';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM SKILL WHERE competenza = p_competenza) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La competenza non esiste nella tabella SKILL';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM PROFILO WHERE id = p_idProfilo) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'L\'ID del profilo non esiste nella tabella PROFILO';
    END IF;

    INSERT INTO S_P (competenza, idProfilo, livello)
    VALUES (p_competenza, p_idProfilo, p_livello);
END
|
DELIMITER ;


/* DEFINIZIONE DELLE VIEW */

/* Visualizzare valore finanziamento totale per ogni progetto */
CREATE VIEW TotaleFinanziamenti AS
SELECT P.nome, SUM(F.importo) AS totale_finanziato
FROM PROGETTO P JOIN FINANZIAMENTO F ON P.nome = F.nome
GROUP BY P.nome;


/* Visualizzare la classifica degli utenti creatori, in base al loro valore di affidabilità. Mostrare solo il nickname dei primi 3 utenti. */
DROP VIEW if exists viewClassifica;
CREATE VIEW viewClassifica(mail, affidabilita) AS
	SELECT mail, affidabilita
	FROM CREATORE
	order by affidabilita desc
    limit 3;

/* Visualizzare i progetti APERTI che sono più vicini al proprio completamento (= minore differenza tra budget richiesto e somma totale dei finanziamenti ricevuti). Mostrare solo i primi 3 progetti. */
DROP VIEW if exists viewClassificaProgettiAperti;
CREATE VIEW viewClassificaProgettiAperti AS
SELECT P.nome, P.descrizione, P.dataInserimento, P.budget, P.dataLimite, 
       P.budget - (SELECT SUM(F.importo) 
                   FROM FINANZIAMENTO F 
                   WHERE F.nome = P.nome) AS differenza_budget
FROM PROGETTO P
WHERE P.stato = 'aperto'
ORDER BY differenza_budget ASC
LIMIT 3;

/* Visualizzare	la	classifica	degli	utenti,	ordinati	in	base	al	TOTALE di	finanziamenti erogati.	
Mostrare	solo	i	nickname	dei	primi	3	utenti.*/
DROP VIEW if exists ClassificaTotFinanziamenti;
CREATE VIEW ClassificaTotFinanziamenti AS
	SELECT U.nickname, SUM(F.importo) AS Totale_Finanziamenti
	FROM UTENTE U, FINANZIAMENTO F
	where U.mail = F.mail
	GROUP BY U.mail
	ORDER BY Totale_Finanziamenti DESC
	LIMIT 3;

/* DEFINIZIONE DEI TRIGGER */

/* triggers per aggiornare l’affidabilità di un utente creatore. L’affidabilità viene calcolata come X è la percentuale di progetti creati dall’utente che hanno ottenuto almeno un finanziamento */
/* condizione: ogni qualvolta un utente crea un progetto*/

DROP TRIGGER if exists aggiornaAffidabilitaOnProgetto;
DELIMITER |
CREATE TRIGGER aggiornaAffidabilitaOnProgetto 
after INSERT ON PROGETTO
FOR EACH ROW
BEGIN
	DECLARE numProgetti FLOAT DEFAULT 0;
	DECLARE numProgettiFinanziati FLOAT DEFAULT 0;
	/* Recupero il numero attuale di progetti dell'utente*/
	select nr_progetti from CREATORE where mail=new.mailC INTO numProgetti;

	/* Recupero il numero attuale di progetti finanziati*/
	select count(DISTINCT F.nome) from FINANZIAMENTO F join PROGETTO P ON(F.nome=P.nome)
    where (P.mailC=new.mailC) INTO numProgettiFinanziati;
    
    /* Solo se il progetto ha finanziamenti, aggiorno l'affidabilità */
	IF numProgettiFinanziati > 0 THEN
        IF numProgetti > 0 THEN
            UPDATE CREATORE 
            SET affidabilita = ROUND(numProgettiFinanziati / numProgetti, 2)
            WHERE mail = NEW.mailC;
        END IF;
    END IF;
END;
|
DELIMITER ;

/* condizione: ogni qualvolta un progetto dell’utente riceve un finanziamento */
DROP TRIGGER IF EXISTS aggiornaAffidabilitaOnFinanziamento;
DELIMITER |
CREATE TRIGGER aggiornaAffidabilitaOnFinanziamento 
AFTER INSERT ON FINANZIAMENTO 
FOR EACH ROW    
BEGIN
	DECLARE numProgetti INT DEFAULT 0;
	DECLARE numProgettiFinanziati INT DEFAULT 0;
	/* Recupero il numero attuale di progetti dell'utente*/
	select nr_progetti from CREATORE where mail=new.mail INTO numProgetti;

	/* Recupero il numero attuale di progetti finanziati*/
	select count(DISTINCT F.nome) from FINANZIAMENTO F join PROGETTO P ON(F.nome=P.nome)
    where (P.mailC=new.mail) INTO numProgettiFinanziati;
    
    /* Solo se il progetto ha finanziamenti, aggiorno l'affidabilità */
	IF numProgettiFinanziati > 0 THEN
        IF numProgetti > 0 THEN
            UPDATE CREATORE 
            SET affidabilita = ROUND(numProgettiFinanziati / numProgetti, 2)
            WHERE mail = NEW.mail;
        END IF;
    END IF;
END;
|
DELIMITER ;


/* Utilizzare un trigger per cambiare lo stato di un progetto. Lo stato di un progetto diventa CHIUSO quando ha raggiunto un valore complessivo di finanziamenti pari al budget richiesto. */
DROP TRIGGER if exists AggiornaStatoProgetto;
DELIMITER |
CREATE TRIGGER AggiornaStatoProgetto
AFTER INSERT ON FINANZIAMENTO
FOR EACH ROW
BEGIN
    DECLARE totale_finanziamenti INT;

    SELECT SUM(importo) INTO totale_finanziamenti
    FROM FINANZIAMENTO
    WHERE nome = NEW.nome;

    UPDATE PROGETTO 
    SET stato = 'chiuso' 
    WHERE nome = NEW.nome AND totale_finanziamenti >= budget;
END;
|
DELIMITER ;

/* condizione: Ogni	qualvolta un utente	creatore inserisce un progetto,	il campo nr_progetti viene incrementato	di un’unità*/
DROP TRIGGER if exists incrementaNrProgetti;
DELIMITER |
CREATE TRIGGER incrementaNrProgetti
AFTER INSERT ON PROGETTO
FOR EACH ROW
BEGIN
    UPDATE CREATORE
    SET nr_progetti = nr_progetti + 1
    WHERE mail = NEW.mailC;
END;
|
DELIMITER ;

SHOW PROCEDURE STATUS WHERE Db = 'BOSTARTER';

INSERT INTO UTENTE (mail, nickname, password, nome, cognome, annoN, luogo) 
VALUES 
('mario.rossi@email.com', 'MarioR', 'Pass123!', 'Mario', 'Rossi', 1995, 'Roma'),
('luca.bianchi@email.com', 'LucaB', 'Secure456$', 'Luca', 'Bianchi', 1998, 'Milano'),
('anna.verdi@email.com', 'AnnaV', 'Anna789%', 'Anna', 'Verdi', 2000, 'Firenze'),
('sara.neri@email.com', 'SaraN', 'SaraPass99', 'Sara', 'Neri', 1993, 'Torino'),
('giovanni.ferri@email.com', 'GiovanniF', 'GioSecure22', 'Giovanni', 'Ferri', 1997, 'Napoli'),
('elena.moro@email.com', 'ElenaM', 'MoroPass33', 'Elena', 'Moro', 1996, 'Bologna'),
('paolo.riva@email.com', 'PaoloR', 'RivaStrong77', 'Paolo', 'Riva', 1992, 'Genova'),
('francesca.fontana@email.com', 'FrancyF', 'Fontana!88', 'Francesca', 'Fontana', 2001, 'Palermo'),
('andrea.serra@email.com', 'AndreaS', 'SerraXx12', 'Andrea', 'Serra', 1999, 'Cagliari'),
('valentina.marchi@email.com', 'ValeM', 'MarchiPass66', 'Valentina', 'Marchi', 1994, 'Verona');

INSERT INTO SKILL (competenza) VALUES 
('Programmazione'),
('Design Grafico'),
('Marketing Digitale'),
('Scrittura Creativa'),
('Gestione Progetti'),
('Fotografia'),
('Montaggio Video'),
('Sviluppo Business'),
('Ingegneria Elettronica'),
('UI/UX Design');

INSERT INTO CREATORE (mail, nr_progetti, affidabilita) VALUES 
('mario.rossi@email.com', 0, 0),
('luca.bianchi@email.com', 0, 0),
('anna.verdi@email.com', 0, 0),
('sara.neri@email.com', 0, 0),
('giovanni.ferri@email.com', 0, 0);

INSERT INTO ADMIN (mail, codSicurezza) VALUES 
('mario.rossi@email.com', 'SEC123XYZ'),
('sara.neri@email.com', 'SAFE456ABC'),
('paolo.riva@email.com', 'PROT789DEF'),
('valentina.marchi@email.com', 'SECURE101GHI'),
('andrea.serra@email.com', 'LOCK202JKL');

INSERT INTO PROGETTO (nome, descrizione, dataInserimento, budget, dataLimite, stato, mailC, tipo) VALUES 
('Smart Home Hub', 'Un dispositivo per la gestione della casa domotica.', '2025-02-15', 5000, '2025-06-15', 'aperto', 'mario.rossi@email.com', 'Hardware'),
('App Fitness Tracker', 'Un app mobile per monitorare l\'attivita fisica.', '2025-01-10', 3000, '2025-05-01', 'aperto', 'luca.bianchi@email.com', 'Software'),
('Drone Fotografico', 'Un drone compatto per fotografie ad alta risoluzione.', '2025-03-01', 8000, '2025-07-01', 'aperto', 'anna.verdi@email.com', 'Hardware'),
('Piattaforma E-Learning', 'Un portale per corsi online interattivi.', '2025-02-20', 7000, '2025-06-30', 'aperto', 'sara.neri@email.com', 'Software'),
('Sistema AI Chatbot', 'Un chatbot basato su AI per customer support.', '2025-01-25', 6000, '2025-04-30', 'aperto', 'giovanni.ferri@email.com', 'Software'),
('Smartwatch Personalizzabile', 'Uno smartwatch con cinturini e display intercambiabili.', '2025-02-05', 10000, '2025-07-15', 'aperto', 'mario.rossi@email.com', 'Hardware'),
('App Finanziaria', 'Un app per la gestione delle spese personali.', '2025-03-10', 4000, '2025-08-10', 'aperto', 'luca.bianchi@email.com', 'Software'),
('Stampante 3D Portatile', 'Una stampante 3D compatta e facile da trasportare.', '2025-01-30', 12000, '2025-06-10', 'aperto', 'anna.verdi@email.com', 'Hardware'),
('Social Network Creativo', 'Una piattaforma per artisti e designer.', '2025-02-12', 9000, '2025-09-01', 'aperto', 'sara.neri@email.com', 'Software'),
('Dispositivo IoT per Piante', 'Un sensore intelligente per monitorare le piante domestiche.', '2025-03-05', 5000, '2025-07-20', 'aperto', 'giovanni.ferri@email.com', 'Hardware');

INSERT INTO FOTO (foto, nomeP) VALUES
("http://13.61.196.206/foto/smart-home-hub.webp", 'Smart Home Hub'),
("http://13.61.196.206/foto/Smart-Home-Hub3.webp", 'Smart Home Hub'),
("http://13.61.196.206/foto/Smart-Home-Hub2.webp", 'Smart Home Hub'),
("http://13.61.196.206/foto/App_Fitness_Tracker.webp", 'App Fitness Tracker'),
("http://13.61.196.206/foto/Drone_Fotografico.webp", 'Drone Fotografico'),
("http://13.61.196.206/foto/Piattaforma_E-Learning.webp", 'Piattaforma E-Learning'),
("http://13.61.196.206/foto/Sistema_AI_Chatbot.webp", 'Sistema AI Chatbot');

INSERT INTO COMMENTO (data, testo, risposta, mail, nome) VALUES
('2025-03-01', 'Questo progetto è molto interessante, non vedo l\'ora di vedere i progressi!', NULL, 'luca.bianchi@email.com', 'Smart Home Hub'),
('2025-03-02', 'Mi piacerebbe saperne di più sulla tecnologia dietro il fitness tracker.', NULL, 'giovanni.ferri@email.com', 'App Fitness Tracker'),
('2025-03-03', 'Spero che il drone abbia una buona stabilità nelle riprese ad alta altitudine.', NULL, 'mario.rossi@email.com', 'Drone Fotografico'),
('2025-03-04', 'Piattaforma molto interessante, mi piace l\'idea di corsi online interattivi.', NULL, 'anna.verdi@email.com', 'Piattaforma E-Learning'),
('2025-03-05', 'Un chatbot basato su AI può davvero migliorare il supporto clienti!', NULL, 'sara.neri@email.com', 'Sistema AI Chatbot');

INSERT INTO COMPONENTE (nomeC, descrizione, prezzo, qt) VALUES
('Modulo Wi-Fi', 'Un modulo per aggiungere connettività Wi-Fi a dispositivi elettronici.', 50, 100),
('Sensore di Temperatura', 'Sensore per misurare la temperatura in ambienti esterni o interni.', 20, 150),
('Batteria Li-Ion', 'Batteria ricaricabile per alimentare dispositivi mobili e hardware portatile.', 40, 200),
('Motore Elettrico', 'Motore ad alta efficienza per applicazioni robotiche o veicoli elettrici.', 120, 80),
('Display LCD 4.3"', 'Display a cristalli liquidi per progetti elettronici di piccole dimensioni.', 25, 50),
('Sensore di Movimento', 'Sensore di movimento per sistemi di sicurezza o automazione domestica.', 15, 120),
('Scheda Arduino Uno', 'Scheda di sviluppo per prototipi elettronici e applicazioni embedded.', 35, 200),
('Camera 4K', 'Camera compatta ad alta risoluzione, ideale per droni o progetti di videosorveglianza.', 250, 30),
('Pannello Solare', 'Pannello solare per alimentare dispositivi elettronici in ambienti esterni.', 150, 60),
('Cinturino Smartwatch', 'Cinturino in silicone per smartwatch personalizzabili.', 10, 300);

INSERT INTO REWARD (foto, descrizione, nomeP) VALUES
("", 'Un kit per l\'automazione della casa, incluso il modulo Wi-Fi e sensori di movimento.', 'Smart Home Hub'),
("", 'Un abbonamento premium con funzionalità avanzate per tracciare i progressi e le prestazioni.', 'App Fitness Tracker'),
("", 'Accessori premium per il drone, inclusi nuovi filtri e una batteria di lunga durata.', 'Drone Fotografico'),
("", 'Un corso online gratuito sulla creazione di contenuti e corsi interattivi sulla piattaforma.', 'Piattaforma E-Learning'),
("", 'Un pacchetto di 5 ore di consulenza su come migliorare le prestazioni del tuo chatbot.', 'Sistema AI Chatbot'),
("", 'Un smartwatch personalizzabile con display intercambiabile.', 'Smartwatch Personalizzabile'),
("", 'Un accessorio aggiuntivo per l\'app, inclusi nuovi strumenti di analisi finanziaria.', 'App Finanziaria'),
("", 'Un kit portatile di stampante 3D, con filamento incluso.', 'Stampante 3D Portatile'),
("", 'Un pacchetto di supporto dedicato agli artisti con strumenti creativi avanzati.', 'Social Network Creativo'),
('http://13.61.196.206/foto/pianta.webp', 'Un sensore IoT per monitorare l\'umidità delle piante e ricevere notifiche.', 'Dispositivo IoT per Piante'),
('http://13.61.196.206/foto/portaChiavi.webp', 'Un sensore IoT per monitorare l\'umidità delle piante e ricevere notifiche.', 'Dispositivo IoT per Piante'),
('http://13.61.196.206/foto/boardGame.webp', 'Un sensore IoT per monitorare l\'umidità delle piante e ricevere notifiche.', 'Dispositivo IoT per Piante'),
('http://13.61.196.206/foto/palla.webp', 'Un sensore IoT per monitorare l\'umidità delle piante e ricevere notifiche.', 'Dispositivo IoT per Piante');

INSERT INTO FINANZIAMENTO (mail, nome, dataF, importo) VALUES
('mario.rossi@email.com', 'Smart Home Hub', '2025-02-20', 2000),
('luca.bianchi@email.com', 'App Fitness Tracker', '2025-01-12', 1500),
('anna.verdi@email.com', 'Drone Fotografico', '2025-03-05', 2500),
('sara.neri@email.com', 'Piattaforma E-Learning', '2025-02-22', 3000),
('giovanni.ferri@email.com', 'Sistema AI Chatbot', '2025-01-28', 2000),
('mario.rossi@email.com', 'Smartwatch Personalizzabile', '2025-02-15', 2500),
('luca.bianchi@email.com', 'App Finanziaria', '2025-03-01', 18000),
('anna.verdi@email.com', 'Stampante 3D Portatile', '2025-01-25', 3500),
('sara.neri@email.com', 'Social Network Creativo', '2025-02-10', 40000),
('giovanni.ferri@email.com', 'Dispositivo IoT per Piante', '2025-03-08', 2200);

INSERT INTO F_R (mail, nome, dataF, codR) VALUES
('mario.rossi@email.com', 'Smart Home Hub', '2025-02-20', '1'),
('luca.bianchi@email.com', 'App Fitness Tracker', '2025-01-12', '2'),
('anna.verdi@email.com', 'Drone Fotografico', '2025-03-05', '3'),
('sara.neri@email.com', 'Piattaforma E-Learning', '2025-02-22', '4'),
('giovanni.ferri@email.com', 'Sistema AI Chatbot', '2025-01-28', '5'),
('mario.rossi@email.com', 'Smartwatch Personalizzabile', '2025-02-15', '6'),
('luca.bianchi@email.com', 'App Finanziaria', '2025-03-01', '7'),
('anna.verdi@email.com', 'Stampante 3D Portatile', '2025-01-25', '8');


INSERT INTO POSSIEDE (mail, competenza, livello) VALUES
('mario.rossi@email.com', 'Programmazione', 4),
('mario.rossi@email.com', 'Gestione Progetti', 3),
('luca.bianchi@email.com', 'Design Grafico', 5),
('luca.bianchi@email.com', 'Marketing Digitale', 4),
('anna.verdi@email.com', 'Fotografia', 4),
('anna.verdi@email.com', 'Montaggio Video', 3),
('sara.neri@email.com', 'UI/UX Design', 5),
('sara.neri@email.com', 'Design Grafico', 4),
('giovanni.ferri@email.com', 'Ingegneria Elettronica', 5),
('giovanni.ferri@email.com', 'Sviluppo Business', 3);

INSERT INTO PROFILO (nome, nomeS) VALUES
('Sviluppatore Frontend', 'App Fitness Tracker'),
('Designer UI/UX', 'App Fitness Tracker'),
('Docente', 'Piattaforma E-Learning'),
('Sviluppatore Web', 'Piattaforma E-Learning'),
('Specialista AI', 'Sistema AI Chatbot'),
('Sviluppatore App', 'Sistema AI Chatbot'),
('Sviluppatore iOS', 'App Finanziaria'),
('Sviluppatore Android', 'App Finanziaria'),
('Social Media Manager', 'Social Network Creativo'),
('Sviluppatore Frontend', 'Social Network Creativo');


INSERT INTO S_P (competenza, idProfilo, livello) VALUES 
('Programmazione', 1, 4), 
('UI/UX Design', 1, 5), 
('Design Grafico', 2, 3), 
('Marketing Digitale', 2, 4), 
('Programmazione', 3, 4), 
('Ingegneria Elettronica', 3, 5), 
('Gestione Progetti', 4, 4), 
('Programmazione', 4, 5), 
('Programmazione', 5, 4), 
('Sviluppo Business', 5, 5), 
('Ingegneria Elettronica', 6, 3), 
('Design Grafico', 6, 4), 
('Programmazione', 7, 4), 
('Programmazione', 9, 5), 
('Programmazione', 10, 5);

INSERT INTO COMPOSTO (nomeC, nomeH) VALUES
('Modulo Wi-Fi', 'Smart Home Hub'),
('Sensore di Movimento', 'Smart Home Hub'),
('Batteria Li-Ion', 'Smart Home Hub'),
('Display LCD 4.3"', 'Smart Home Hub'),
('Motore Elettrico', 'Drone Fotografico'),
('Camera 4K', 'Drone Fotografico'),
('Batteria Li-Ion', 'Drone Fotografico'),
('Modulo Wi-Fi', 'Piattaforma E-Learning'),
('Sensore di Temperatura', 'Piattaforma E-Learning'),
('Batteria Li-Ion', 'Piattaforma E-Learning'),
('Scheda Arduino Uno', 'Sistema AI Chatbot'),
('Sensore di Movimento', 'Sistema AI Chatbot'),
('Sensore di Temperatura', 'Sistema AI Chatbot'),
('Cinturino Smartwatch', 'Smartwatch Personalizzabile'),
('Display LCD 4.3"', 'Smartwatch Personalizzabile'),
('Batteria Li-Ion', 'Smartwatch Personalizzabile'),
('Modulo Wi-Fi', 'App Finanziaria'),
('Sensore di Temperatura', 'App Finanziaria'),
('Cinturino Smartwatch', 'App Finanziaria'),
('Pannello Solare', 'Stampante 3D Portatile'),
('Motore Elettrico', 'Stampante 3D Portatile'),
('Batteria Li-Ion', 'Stampante 3D Portatile'),
('Display LCD 4.3"', 'Social Network Creativo'),
('Scheda Arduino Uno', 'Social Network Creativo'),
('Sensore di Movimento', 'Social Network Creativo'),
('Motore Elettrico', 'Dispositivo IoT per Piante'),
('Sensore di Temperatura', 'Dispositivo IoT per Piante'),
('Batteria Li-Ion', 'Dispositivo IoT per Piante');

INSERT INTO CANDIDATURA (mail, id, stato) VALUES
('mario.rossi@email.com', 1, 'in attesa'),  -- Candidato per il profilo 1
('luca.bianchi@email.com', 2, 'in attesa'), -- Candidato per il profilo 2
('anna.verdi@email.com', 3, 'in attesa'),   -- Candidato per il profilo 3
('sara.neri@email.com', 4, 'in attesa'),    -- Candidato per il profilo 4
('giovanni.ferri@email.com', 5, 'in attesa'), -- Candidato per il profilo 5
('mario.rossi@email.com', 6, 'in attesa'),  -- Candidato per il profilo 6
('luca.bianchi@email.com', 7, 'in attesa'), -- Candidato per il profilo 7
('anna.verdi@email.com', 8, 'in attesa'),   -- Candidato per il profilo 8
('sara.neri@email.com', 9, 'in attesa'),    -- Candidato per il profilo 9
('giovanni.ferri@email.com', 10, 'in attesa'); -- Candidato per il profilo 10

SELECT * FROM UTENTE;
SELECT * FROM CREATORE;
SELECT * FROM ADMIN;
SELECT * FROM PROGETTO;
SELECT * FROM FINANZIAMENTO;
SELECT * FROM REWARD;
SELECT * FROM F_R;
SELECT * FROM FOTO;
SELECT * FROM COMMENTO;
SELECT * FROM COMPONENTE;
SELECT * FROM COMPOSTO;
SELECT * FROM SKILL;
SELECT * FROM POSSIEDE;
SELECT * FROM PROFILO;
SELECT * FROM S_P;
SELECT * FROM CANDIDATURA;

select * from viewClassifica;
select * from viewClassificaProgettiAperti;
select * from ClassificaTotFinanziamenti;

CALL getUserRole('sara.neri@email.com', @role);
SELECT @role;

SHOW PROCEDURE STATUS WHERE Db = 'BOSTARTER';


