<?php
require_once 'config.php';
require  __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Recupero i dati inviati dal client
    $data = json_decode(file_get_contents('php://input'), true);
    $mail = $data["mail"];
    $id = $data["id"];
    $stato = $data["stato"];

    // Connessione al DB
    try {
        $pdo = new PDO('mysql:host='.servername.';dbname='.dbName, dbUsername, dbPassword);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
        echo json_encode(["error" => "[ERRORE] Connessione al DB non riuscita. Errore: " . $e->getMessage()]);
        exit();
    }

    try {
        // Preparing the SQL query to call the procedure
        $sql = "CALL InserisciCandidatura(:mail, :id, :stato)";
        $stmt = $pdo->prepare($sql);

        // Binding the input parameters
        $stmt->bindParam(':mail', $mail, PDO::PARAM_STR);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->bindParam(':stato', $stato, PDO::PARAM_STR);

        // Execute the query
        $stmt->execute();

        echo json_encode(["success" => "Candidatura inserita con successo"]);
    } catch (PDOException $e) {
        echo json_encode(["error" => "[ERRORE] Inserimento candidatura non riuscito. Errore: " . $e->getMessage()]);
        exit();
    }
} else {
    echo json_encode(["error" => "HTTP method not allowed"]);
}
?>
