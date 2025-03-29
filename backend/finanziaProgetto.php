<?php
require_once 'config.php';
require 'protected.php';
require  __DIR__ . '/../vendor/autoload.php';
require_once 'logMongoDB.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (verifyJwtToken()) {
        // Recupero i dati inviati dal client
        $data = json_decode(file_get_contents('php://input'), true);
        $mail = $data["mail"];
        $nomeProgetto = $data["nomeProgetto"];
        $dataFinanziamento = $data["dataFinanziamento"];
        $importoFinanziamento = $data["importoFinanziamento"];
        $codiceReward = $data["codiceReward"];

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
            $sql = "CALL finanziaProgetto(:mail, :nomeProgetto, :dataFinanziamento, :importoFinanziamento, :codiceReward)";
            $stmt = $pdo->prepare($sql);

            // Binding the input parameters
            $stmt->bindParam(':mail', $mail, PDO::PARAM_STR);
            $stmt->bindParam(':nomeProgetto', $nomeProgetto, PDO::PARAM_STR);
            $stmt->bindParam(':dataFinanziamento', $dataFinanziamento, PDO::PARAM_STR);
            $stmt->bindParam(':importoFinanziamento', $importoFinanziamento, PDO::PARAM_INT);
            $stmt->bindParam(':codiceReward', $codiceReward, PDO::PARAM_STR);

            // Execute the query
            $result = $stmt->execute();

            $text = "timeStamp: " . date('Y-m-d H:i:s').";mail: " . $mail . ";progetto: " . $nomeProgetto . ";data: " . $dataFinanziamento . ";queryType: INSERT;query: " . $sql . ";result: " . $result;
            $resp = writeLog($text);

            echo json_encode(["result" => $result]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "[ERRORE] Query SQL non riuscita. Errore: " . $e->getMessage()]);
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