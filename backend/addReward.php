<?php
require_once 'config.php';
require 'protected.php';
require_once 'logMongoDB.php';
require  __DIR__ . '/../vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (true) {
        // Recupero i dati inviati dal client
        $data = json_decode(file_get_contents('php://input'), true);
        //$inputCod = $data["codice"];
        $inputFoto = $data["foto"];
        $inputDescrizione = $data["descrizione"];
        $inputNomeP = $data["progetto"];

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
            // Preparing the SQL query to call the procedure with an output parameter
            $sql = "CALL addReward(:inputFoto, :inputDescrizione, :inputNomeP)";
            $stmt = $pdo->prepare($sql);

            // Binding the input parameters
            //$stmt->bindParam(':inputCod', $inputCod, PDO::PARAM_STR);
            $stmt->bindParam(':inputFoto', $inputFoto, PDO::PARAM_STR);
            $stmt->bindParam(':inputDescrizione', $inputDescrizione, PDO::PARAM_LOB);
            $stmt->bindParam(':inputNomeP', $inputNomeP, PDO::PARAM_STR);

            // Execute the query
            $result = $stmt->execute();

            $text = "timeStamp: " . date('Y-m-d H:i:s').";queryType: INSERT;query: " . $sql . ";result: " . $result;
            $resp = writeLog($text);

            echo $result;
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
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "HTTP method not allowed"]);
}
?>