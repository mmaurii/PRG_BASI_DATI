<?php
// Configurazione della connessione al database
$servername = "13.61.196.206";  // Usa "localhost" se il database è sulla stessa macchina
$username = "prova";         // Nome utente MySQL (modifica se necessario)
$password = "MyNewPass1!";   // Password dell'utente MySQL (se impostata)
$dbname = "gestione_persone";  // Il nome del database

// Crea la connessione
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica la connessione
if ($conn->connect_error) {
    die("Connessione fallita: " . $conn->connect_error);
}

// Query per ottenere tutti i dati dalla tabella "persona"
$sql = "SELECT * FROM persona";
$result = $conn->query($sql);

// Verifica se la query è riuscita
if ($result === false) {
    die("Errore nella query: " . $conn->error);
}

// Inizio dell'elenco HTML
echo "<h2>Elenco delle persone</h2>";
echo "<ul>";

// Controlla se ci sono risultati
if ($result->num_rows > 0) {
    // Ciclo su tutte le righe della tabella "persona"
    while($row = $result->fetch_assoc()) {
        echo "<li><strong>" . $row["nome"] . " " . $row["cognome"] . "</strong> (CF: " . $row["codice_fiscale"] . ")</li>";
    }
} else {
    echo "<li>Nessun risultato trovato</li>";
}

echo "</ul>";

// Chiudi la connessione
$conn->close();
?>
