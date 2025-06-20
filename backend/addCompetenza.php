<?php
require_once 'config.php';
require_once 'logMongoDB.php';
require  __DIR__ . '/../vendor/autoload.php';
require_once 'protected.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if (verifyJwtToken()) {
        if (isAdmin()) {
            // Recupero i dati inviati dal client
            $data = json_decode(file_get_contents('php://input'), true);
            $competenza = $data["competenza"];

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
                // Preparing the SQL query to call the procedure
                $sql = "CALL InserisciCompetenza(:competenza)";
                $stmt = $pdo->prepare($sql);

                // Binding the input parameter (competenza)
                $stmt->bindParam(':competenza', $competenza, PDO::PARAM_STR);

                // Execute the query
                $result = $stmt->execute();

                $text = "timeStamp: " . date('Y-m-d H:i:s') . ";competenza: " . $competenza . ";queryType: INSERT;query: " . $sql . ";result: " . $result;
                $resp = writeLog($text);

                echo json_encode(["result" => "Competenza inserita con successo"]);
            } catch (PDOException $e) {
                $errorInfo = $stmt->errorInfo();
                http_response_code(500);
                echo json_encode([
                    "sqlstate" => $errorInfo[0],
                    "errorcode" => $errorInfo[1],
                    "error" => $errorInfo[2]
                ]);
                exit();
            }
        } else {
            http_response_code(401);
            echo json_encode(["error" => "non sei un admin"]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["error" => "non sei loggato"]);
    }
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "HTTP method not allowed"]);
}
?>