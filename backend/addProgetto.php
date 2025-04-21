<?php
require_once 'config.php';
require_once 'logMongoDB.php';
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
    $imageUrls = $data["imageUrls"];

    // Connessione al DB
    try {
        $pdo = new PDO('mysql:host='.servername.';dbname='.dbName, dbUsername, dbPassword);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec(mysqlCharachter);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "[ERRORE] Connessione al DB non riuscita"]);
    exit();
    }

    try {
        // Preparazione della query SQL
        $sql = "CALL InserisciProgetto(:nome, :descrizione, :dataInserimento, :budget, :dataLimite, :stato, :mailC, :tipo)";
        $stmt = $pdo->prepare($sql);

        // Binding dei parametri di input
        $stmt->bindParam(':nome', $nome, PDO::PARAM_STR);
        $stmt->bindParam(':descrizione', $descrizione, PDO::PARAM_STR);
        $stmt->bindParam(':dataInserimento', $dataInserimento, PDO::PARAM_STR);
        $stmt->bindParam(':budget', $budget, PDO::PARAM_INT);
        $stmt->bindParam(':dataLimite', $dataLimite, PDO::PARAM_STR);
        $stmt->bindParam(':stato', $stato, PDO::PARAM_STR);
        $stmt->bindParam(':mailC', $mailC, PDO::PARAM_STR);
        $stmt->bindParam(':tipo', $tipo, PDO::PARAM_STR);

        // Esegui la query
        $stmt->execute();

        // Aggiungi il file immagine alla tabella FOTO
        $sql = "INSERT INTO FOTO (foto, nomeP) VALUES (:foto, :nomeP)";
        $stmt = $pdo->prepare($sql);
    
        foreach ($imageUrls as $imageUrl) {
            $stmt->bindParam(':foto', $imageUrl, PDO::PARAM_STR);
            $stmt->bindParam(':nomeP', $nome, PDO::PARAM_STR);
            $stmt->execute();
        }

        echo json_encode(["result" => "Progetto inserito con successo e immagine caricata", "imageUrl" => $imageUrl]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "[ERRORE] Impossibile inserire il progetto. Errore: " . $e->getMessage()]);
        exit();
    }
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "HTTP method not allowed"]);
}
?>