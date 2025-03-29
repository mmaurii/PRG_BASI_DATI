<?php
require_once 'config.php';
require_once 'logMongoDB.php';
require_once 'protected.php';

require  __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (verifyJwtToken()) {
        // Recupero i dati inviati dal client
        $data = json_decode(file_get_contents('php://input'), true);
        $mail = $data["mail"];
        $id = $data["id"];

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
            $sql = "CALL InserisciCandidatura(:mail, :id)";
            $stmt = $pdo->prepare($sql);

            // Binding the input parameters
            $stmt->bindParam(':mail', $mail, PDO::PARAM_STR);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);

            // Execute the query
            $result = $stmt->execute();

            $text = "timeStamp: " . date('Y-m-d H:i:s') . ";mail: " . $mail . ";id: " . $id . ";queryType: INSERT;query: " . $sql . ";result: " . $result;
            $resp = writeLog($text);

            echo json_encode(["result" => "Candidatura inserita con successo"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "[ERRORE] Inserimento candidatura non riuscito. Errore: " . $e->getMessage()]);
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
