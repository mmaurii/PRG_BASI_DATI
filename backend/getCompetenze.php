<?php
require_once 'config.php';
require  __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    
    // Connessione al DB
    try {
        $pdo = new PDO('mysql:host=' . servername . ';dbname=' . dbName, dbUsername, dbPassword);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec(mysqlCharachter);
    } catch (PDOException $e) {
        echo json_encode(["error" => "[ERRORE] Connessione al DB non riuscita. Errore: " . $e->getMessage()]);
        exit();
    }

    try {
        $sql = "CALL getCompetenze()";
        $stmt = $pdo->prepare($sql);

        // Esegui la query
        $stmt->execute();

        // Recupera tutte le competenze
        $competencies = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($competencies) > 0) {
            // Se ci sono competenze, restituiscile in formato JSON
            echo json_encode(["competencies" => $competencies]);
        } else {
            // Se non ci sono competenze, restituisci un messaggio appropriato
            echo json_encode(["message" => "Nessuna competenza trovata"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["error" => "[ERRORE] Impossibile ottenere le competenze. Errore: " . $e->getMessage()]);
        exit();
    }
} else {
    echo json_encode(["error" => "HTTP method not allowed"]);
}
?>
