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
    stato ENUM('accepted', 'rejected', 'pending') default 'pending',
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
	if exists(
		select mail, password
				FROM UTENTE U
				WHERE (U.mail=inputMail) AND 
					(U.password=inputPassword) and 
                    not exists(Select mail from ADMIN A where A.mail=inputMail)
	) then
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
	
    if(exists (select 1 from POSSIEDE where mail = inputMail and competenza = inputCompetenza)) then
    	if (inputLivello>=0 and inputLivello <=5) then
			update POSSIEDE 
            set livello = inputLivello
            where mail = inputMail and competenza = inputCompetenza;
			set isSet = true;
		end if;
        
        if(inputLivello = -1) then
			delete from POSSIEDE
            where mail = inputMail and competenza = inputCompetenza;
			set isSet = true;
        end if;
	else
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
	select P.*, T.totale_finanziato
    from PROGETTO P left join TotaleFinanziamenti T on (P.nome = T.nome)
    where P.stato = 'aperto';
END;
|
DELIMITER ;

/* creo una procedura per la ricerca dei progetti */
drop PROCEDURE if exists searchProgetti;
DELIMITER |
CREATE PROCEDURE searchProgetti(IN titolo VARCHAR(255))
BEGIN
    SELECT *
    FROM PROGETTO
    WHERE nome LIKE CONCAT('%', titolo, '%');
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
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
	if not exists(select * from PROGETTO where (nome = inputNome) and (stato = 'aperto')) then
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'inputNome doesn\'t exists or is not an open project';
    END IF;
    
    if exists(select 1 from FINANZIAMENTO where mail=inputMail and nome=inputNome and DATE(dataF) = DATE(inputData)) then
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'il finanziamento oggi è già stato fatto';
    end if;
    
    start transaction;
		insert into FINANZIAMENTO (mail, nome, dataF, importo)
		values (inputMail, inputNome, inputData, inputImporto);
			
		if (inputCodR is not null) then
			call chooseReward(inputMail, inputNome, inputData, inputCodR);
		END IF;
    commit;
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
CREATE PROCEDURE InserisciCandidatura(IN inputMail VARCHAR(255), IN inputId INT)
BEGIN

    IF EXISTS(
        SELECT 1
          FROM PROFILO
          JOIN PROGETTO ON PROFILO.nomeS = PROGETTO.nome
         WHERE PROFILO.id = inputId
           AND PROGETTO.mailC = inputMail
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Non puoi candidarti a un profilo del tuo stesso progetto';
    END IF;

	IF EXISTS (SELECT 1 FROM CANDIDATURA WHERE mail = inputMail AND id = inputId) THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Candidatura già presente';
	END IF;
    
    if not exists(select 1 from PROFILO where id = inputId) then
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Profile with inputId doesn\'t exists';
    END IF;
    
	if not exists(select 1 from UTENTE where mail = inputMail) then
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'User with inputMail doesn\'t exists';
    END IF;
    
	INSERT INTO CANDIDATURA (mail, id) VALUES (inputMail, inputId);
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
        SET MESSAGE_TEXT = 'Competenza alredy exists';
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
    if(inputMail is null) then
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

DROP PROCEDURE IF EXISTS addResponseToComment;
DELIMITER |
CREATE PROCEDURE addResponseToComment(
    IN inputId INT,
    IN inputRisposta TEXT,
    IN inputMailCreatore VARCHAR(255)
)
BEGIN
    DECLARE mailCreatoreDB VARCHAR(255);

    -- Recupera la mail del creatore del progetto legato al commento
    SELECT P.mailC INTO mailCreatoreDB
    FROM COMMENTO C
    JOIN PROGETTO P ON C.nome = P.nome
    WHERE C.id = inputId;

    -- Controllo se il commento esiste
    IF mailCreatoreDB IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Commento non trovato';
    END IF;

    -- Controllo se è autorizzato
    IF mailCreatoreDB != inputMailCreatore THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Non autorizzato a rispondere a questo commento';
    END IF;

    -- Controllo se la risposta esiste già
    IF EXISTS (SELECT 1 FROM COMMENTO WHERE id = inputId AND risposta IS NOT NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Risposta già presente';
    END IF;

    -- Esegui aggiornamento
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
    IN mail VARCHAR(255),
    OUT outputProfileID INT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
          FROM PROGETTO
         WHERE nome  = inputNomeS
           AND mailC = mail
    ) THEN
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Errore: non sei il creatore di questo progetto o il progetto non esiste.';
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
CREATE PROCEDURE manageApplicationStatus(
    IN inputMail VARCHAR(255), 
    IN inputId INT, 
    IN inputStato VARCHAR(50), 
    IN inputMailCreatore VARCHAR(255)
)
BEGIN
    -- Verifica che la candidatura esista
    IF NOT EXISTS (
        SELECT 1 
        FROM CANDIDATURA 
        WHERE mail = inputMail AND id = inputId
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Candidatura non trovata';
    END IF;

    -- Verifica che il profilo appartenga a un progetto creato da inputMailCreatore
    IF NOT EXISTS (
        SELECT 1
        FROM PROFILO P
        JOIN PROGETTO PR ON P.nomeS = PR.nome
        WHERE P.id = inputId AND PR.mailC = inputMailCreatore
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Non sei autorizzato a modificare lo stato di questa candidatura';
    END IF;

    -- Aggiorna lo stato della candidatura
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

/*ottenere tutte le candidature di un certo profilo*/
DROP PROCEDURE IF EXISTS getCandidatureByProfiloId;
DELIMITER |
CREATE PROCEDURE getCandidatureByProfiloId(
    IN profiloId INT,
    IN mailCreatore VARCHAR(255)
)
BEGIN
    DECLARE progetto_nome VARCHAR(255);

    -- Controlla se il profilo esiste
    IF NOT EXISTS (
        SELECT 1
        FROM PROFILO
        WHERE id = profiloId
    ) THEN
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Errore: il profilo non esiste.';
    END IF;

    -- Ottieni il nome del progetto associato al profilo
    SELECT nomeS INTO progetto_nome
    FROM PROFILO
    WHERE id = profiloId;

    -- Verifica che il progetto appartenga al creatore specificato
    IF NOT EXISTS (
        SELECT 1
        FROM PROGETTO
        WHERE nome = progetto_nome AND mailC = mailCreatore
    ) THEN
        SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'Errore: non sei il creatore del progetto associato a questo profilo.';
    END IF;

    -- Se tutti i controlli sono superati, restituisci le candidature
    SELECT *
    FROM CANDIDATURA
    WHERE id = profiloId;

END;
|
DELIMITER ;



/* ottiene tutte le statistiche relative all'utente */
DROP PROCEDURE IF EXISTS getUserStatistics;
DELIMITER |
CREATE PROCEDURE getUserStatistics(IN inputMail VARCHAR(255))
BEGIN
    SELECT COUNT(*) as nCandidature FROM CANDIDATURA C WHERE C.mail = inputMail;

    SELECT COUNT(*) as nCommenti FROM COMMENTO C WHERE C.mail = inputMail;
    
    SELECT SUM(F.importo) as totaleFinanziato, COUNT(*) as nFinanziamenti FROM FINANZIAMENTO F WHERE F.mail = inputMail;

    SELECT COUNT(*) as nCompetenze FROM POSSIEDE P WHERE P.mail = inputMail;
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
CREATE VIEW viewClassifica AS
    SELECT U.nickname
    FROM CREATORE C
    JOIN UTENTE U ON C.mail = U.mail
    ORDER BY C.affidabilita DESC
    LIMIT 3;

/* Visualizzare i progetti APERTI che sono più vicini al proprio completamento (= minore differenza tra budget richiesto e somma totale dei finanziamenti ricevuti). Mostrare solo i primi 3 progetti. */
DROP VIEW IF EXISTS viewClassificaProgettiAperti;
CREATE VIEW viewClassificaProgettiAperti AS
SELECT P.nome, P.descrizione, P.dataInserimento, P.budget, P.dataLimite, 
       P.budget - IFNULL((SELECT SUM(F.importo) 
                          FROM FINANZIAMENTO F 
                          WHERE F.nome = P.nome), 0) AS differenza_budget
FROM PROGETTO P
WHERE P.stato = 'aperto'
ORDER BY differenza_budget ASC
LIMIT 3;

/* Visualizzare	la	classifica	degli	utenti,	ordinati	in	base	al	TOTALE di	finanziamenti erogati.	
Mostrare	solo	i	nickname	dei	primi	3	utenti.*/
DROP VIEW if exists ClassificaTotFinanziamenti;
CREATE VIEW ClassificaTotFinanziamenti AS
    SELECT U.nickname
    FROM UTENTE U
    JOIN FINANZIAMENTO F ON U.mail = F.mail
    GROUP BY U.mail
    ORDER BY SUM(F.importo) DESC
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

/* EVENT DECLARATIONS */
SET GLOBAL event_scheduler = ON;
SET GLOBAL time_zone = '+02:00';  -- per l'ora italiana (CET o CEST)

/* Creo un evento che chiuda il progetto quando si raggiunge la data di scadenza del progetto */
DROP EVENT IF EXISTS chiudiProgettiScaduti;
DELIMITER |
CREATE EVENT chiudiProgettiScaduti 
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURDATE() + INTERVAL '00:00:01' HOUR_SECOND)
DO
  UPDATE PROGETTO
  SET stato = 'chiuso'
  WHERE DATE(dataLimite) <= CURDATE() AND stato = 'aperto';
|
DELIMITER ;
