<?php
require_once 'config.php';
require  __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$issuedAt = time();
$expirationTime = $issuedAt + 3600;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Recupero i dati inviati dal client
    $data = json_decode(file_get_contents('php://input'), true);
    $nome = $data["nome"];
    $descrizione = $data["descrizione"];
    $dataInserimento = $data["dataInserimento"];
    $budget = $data["budget"];
    $dataLimite = $data["dataLimite"];
    $stato = $data["stato"];
    $mailC = $data["mailC"];
    $tipo = $data["tipo"];

    // Connessione al DB
    try {
        $pdo = new PDO('mysql:host='.servername.';dbname='.dbName, dbUsername, dbPassword);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec(mysqlCharachter);
    } catch (PDOException $e) {
        echo json_encode(["error" => "[ERRORE] Connessione al DB non riuscita. Errore: " . $e->getMessage()]);
        exit();
    }

    try {
        // Preparing the SQL query to call the procedure
        $sql = "CALL InserisciProgetto(:nome, :descrizione, :dataInserimento, :budget, :dataLimite, :stato, :mailC, :tipo)";
        $stmt = $pdo->prepare($sql);

        // Binding the input parameters
        $stmt->bindParam(':nome', $nome, PDO::PARAM_STR);
        $stmt->bindParam(':descrizione', $descrizione, PDO::PARAM_STR);
        $stmt->bindParam(':dataInserimento', $dataInserimento, PDO::PARAM_STR);
        $stmt->bindParam(':budget', $budget, PDO::PARAM_INT);
        $stmt->bindParam(':dataLimite', $dataLimite, PDO::PARAM_STR);
        $stmt->bindParam(':stato', $stato, PDO::PARAM_STR);
        $stmt->bindParam(':mailC', $mailC, PDO::PARAM_STR);
        $stmt->bindParam(':tipo', $tipo, PDO::PARAM_STR);

        // Execute the query
        $stmt->execute();

        $text = "timeStamp: " . date('Y-m-d H:i:s').";nomeProgetto: " . $nome . ";queryType: INSERT;query: " . $sql . ";result: " . $result;
        $resp = writeLog($text);

        echo json_encode(["success" => "Progetto inserito con successo"]);
    } catch (PDOException $e) {
        echo json_encode(["error" => "[ERRORE] Impossibile inserire il progetto. Errore: " . $e->getMessage()]);
        exit();
    }
} else {
    echo json_encode(["error" => "HTTP method not allowed"]);
}
?>
