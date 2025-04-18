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
        http_response_code(500);
        echo json_encode(["error" => "[ERRORE] Connessione al DB non riuscita"]);
        exit();
    }

    try {
//        if (isset($_GET['mail'])) {
            $mail = $_GET['mail'] ?? null; // Recupera il parametro 'mail' dalla query string

            $sql = "CALL getCompetenze(:mail)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':mail', $mail, PDO::PARAM_STR);

            // Esegui la query
            $stmt->execute();

            // Recupera tutte le competenze
            $competencies = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Se ci sono competenze, restituiscile in formato JSON
            echo json_encode(["result" => $competencies]);
/*         } else {
            echo json_encode(["error" => "Parametro 'mail' mancante"]);
        }
 */    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "[ERRORE] Impossibile ottenere le competenze. Errore: " . $e->getMessage()]);
        exit();
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "HTTP method not allowed"]);
}
?>
