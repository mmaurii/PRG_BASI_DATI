<?php
require_once 'config.php';
require_once 'protected.php';
require __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if(isCreator()) {
        // Decodifica il JWT per ottenere la mail del creatore
        $headers = apache_request_headers();
        if (!isset($headers['Authorization'])) {
            http_response_code(401);
            echo json_encode(["error" => "Token non presente"]);
            exit();
        }

        $payload = decodeJwt();
        $mailCreatore = $payload['username'];

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
            if (isset($_GET['id'])) {
                $id = $_GET['id'];

                $sql = "CALL getCandidatureByProfiloId(:profiloId, :mailCreatore)";
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(':profiloId', $id, PDO::PARAM_INT);
                $stmt->bindParam(':mailCreatore', $mailCreatore, PDO::PARAM_STR);

                // Esegui la query
                $stmt->execute();

                // Recupera tutte le candidature
                $candidature = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode(["result" => $candidature]);
            } else {
                echo json_encode(["error" => "Parametro 'id' mancante"]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "[ERRORE] Impossibile ottenere le candidature. Errore: " . $e->getMessage()]);
            exit();
        }
    } else {
        http_response_code(401);
        echo json_encode(["error" => "jwtToken not valid"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "HTTP method not allowed"]);
}
?>
