<?php
require_once 'config.php';
require  __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

if ($_SERVER["REQUEST_METHOD"] == "GET") {
//(loggato) non usato?
    // Connessione al DB
    try {
        $pdo = new PDO('mysql:host=' . servername . ';dbname=' . dbName, dbUsername, dbPassword);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec(mysqlCharachter);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "[ERRORE] Connessione al DB non riuscita"]);
        exit();
    }

    // Verifica se il parametro 'progetto' è presente nei parametri GET
    if (isset($_GET['mail'])) {
        try {
            $mail = $_GET['mail'];

            $sql = "CALL getCompetenze(:mail)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':mail', $mail, PDO::PARAM_STR);

            // Esegui la query
            $stmt->execute();

            // Recupera tutte le competenze
            $competencies = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (count($competencies) > 0) {
                // Se ci sono competenze, restituiscile in formato JSON
                echo json_encode(["result" => $competencies]);
            } else {
                // Se non ci sono competenze, restituisci un messaggio appropriato
                echo json_encode(["error" => "Nessuna competenza trovata"]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "[ERRORE] Impossibile ottenere le competenze. Errore: " . $e->getMessage()]);
            exit();
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Parametro 'mail' mancante"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "HTTP method not allowed"]);
}
