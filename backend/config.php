<?php
// Configurazione della connessione al database
const servername = "13.61.196.206";  // Usa "localhost" se il database è sulla stessa macchina
const dbUsername = "prova";         // Nome utente MySQL (modifica se necessario)
const dbPassword = "MyNewPass1!";   // Password dell'utente MySQL (se impostata)
const dbName = "BOSTARTER";  // Il nome del database

// key for JWT connection
//define('JWTKEY', bin2hex(random_bytes(32))); 
const JWTKEY = "f86c6682c64bda78122fb8382544a0656302f7082dc0b2c25300125846ab946c"; // Keep this secret!
?>