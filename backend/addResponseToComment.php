<?php
require_once 'config.php';
require 'protected.php';
require_once 'logMongoDB.php';
require  __DIR__ . '/../vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "PUT") {
    if (isCreator()) {

        $payload = decodeJwt();
        $mailCreatore = $payload['username']; // Prendi la mail del creatore dal JWT

        // Recupero i dati inviati dal client
        $data = json_decode(file_get_contents('php://input'), true);
        $inputId = $data["id"];
        $inputRisposta = $data["risposta"];

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
            // Prepariamo la query per chiamare la procedura con il parametro aggiuntivo
            $sql = "CALL addResponseToComment(:inputId, :inputRisposta, :inputMailCreatore)";
            $stmt = $pdo->prepare($sql);

            // Bind dei parametri di input
            $stmt->bindParam(':inputId', $inputId, PDO::PARAM_INT);
            $stmt->bindParam(':inputRisposta', $inputRisposta, PDO::PARAM_STR);
            $stmt->bindParam(':inputMailCreatore', $mailCreatore, PDO::PARAM_STR);

            // Eseguiamo la query
            $result = $stmt->execute();

            $text = "timeStamp: " . date('Y-m-d H:i:s') . 
            ";inputId: " . $inputId . 
            ";inputRisposta: " . $inputRisposta . 
            ";inputMailCreatore: " . $mailCreatore . 
            ";queryType: UPDATE" . 
            ";query: " . $sql . 
            ";result: " . $result;

            $resp = writeLog($text);

            echo json_encode([
                "result" => $result
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo ("[ERRORE] Query SQL non riuscita. Errore: " . $e->getMessage());
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
