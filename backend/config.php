<?php
// Configurazione della connessione al database
$servername = "13.61.196.206";  // Usa "localhost" se il database è sulla stessa macchina
$dbUsername = "prova";         // Nome utente MySQL (modifica se necessario)
$dbPassword = "MyNewPass1!";   // Password dell'utente MySQL (se impostata)
$dbName = "BOSTARTER";  // Il nome del database

// key for JWT connection
$jwtKey = bin2hex(random_bytes(32)); // Keep this secret!
?>