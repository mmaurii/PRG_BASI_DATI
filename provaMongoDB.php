<?php
// Configurazione della connessione al database
$servername = "13.61.196.206";  // Usa "localhost" se il database è sulla stessa macchina

require 'vendor/autoload.php'; // Include MongoDB library

try {
    // Connect to MongoDB
    $client = new MongoDB\Client("mongodb://13.61.196.206:27017");

    // Select database and collection
    $db = $client->BOSTARTER;
    $collection = $db->EVENTO;

    // Fetch all documents
    $cursor = $collection->find();

    // Convert to array and display JSON response
    $results = iterator_to_array($cursor);
    //echo json_encode($results, JSON_PRETTY_PRINT);
    
    // Inizio dell'elenco HTML
    echo "<h2>Elenco degli inserimenti:</h2>";
    echo "<ul>";
    
    // Controlla se ci sono risultati
    if (!empty($results)) {
        // Itera sui documenti della collezione
        foreach ($results as $document) {
            echo "<li><strong>" . htmlspecialchars($document["testo"]) . "</strong></li>";
        }
    } else {
        echo "<li>Nessun risultato trovato</li>";
    }

    
    echo "</ul>";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
