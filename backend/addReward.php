<?php
require_once 'config.php';
require 'protected.php';
require  __DIR__ . '/../vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isCreator() || isCreatorAndAdmin()) {
        // Recupero i dati inviati dal client
        $data = json_decode(file_get_contents('php://input'), true);
        $inputCod = $data["codice"];
        $inputFoto = $data["foto"];
        $inputDescrizione = $data["descrizione"];
        $inputNomeP = $data["progetto"];

        try {
            $pdo = new PDO('mysql:host=' . servername . ';dbname=' . dbName, dbUsername, dbPassword);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->exec(mysqlCharachter);
        } catch (PDOException $e) {
            return json_encode(["error" => "[ERRORE] Connessione al DB non riuscita. Errore: " . $e->getMessage()]);
            exit();
        }

        try {
            // Preparing the SQL query to call the procedure with an output parameter
            $sql = "CALL addReward(:inputCod, :inputFoto, :inputDescrizione, :inputNomeP)";
            $stmt = $pdo->prepare($sql);

            // Binding the input parameters
            $stmt->bindParam(':inputCod', $inputCod, PDO::PARAM_STR);
            $stmt->bindParam(':inputFoto', $inputFoto, PDO::PARAM_STR);
            $stmt->bindParam(':inputDescrizione', $inputDescrizione, PDO::PARAM_LOB);
            $stmt->bindParam(':inputNomeP', $inputNomeP, PDO::PARAM_STR);

            // Execute the query
            $result = $stmt->execute();

            $text = "timeStamp: " . date('Y-m-d H:i:s').";inputCod: " . $inputCod . ";queryType: INSERT;query: " . $sql . ";result: " . $result;
            $resp = writeLog($text);

            echo $result;
        } catch (PDOException $e) {
            echo ("[ERRORE] Query SQL non riuscita. Errore: " . $e->getMessage());
            exit();
        }
    } else {
        echo json_encode(["error" => "jwtToken not valid"]);
    }
} else {
    echo json_encode(["error" => "HTTP method not allowed"]);
}
?>