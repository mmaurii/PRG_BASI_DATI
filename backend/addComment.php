<?php
require_once 'config.php';
require 'protected.php';
require  __DIR__ . '/../vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if(verifyJwtToken()) {
        // Recupero i dati inviati dal client
        $data = json_decode(file_get_contents('php://input'), true);
        $mail = $data["mail"];
        $nomeProgetto = $data["nomeProgetto"];
        $testo = $data["testo"];
        $dataCommento = $data["data"];

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
            // Preparazione della query per chiamare la stored procedure con parametro di output
            $sql = "CALL addComment(:mail, :nomeProgetto, :testo, :dataCommento, @newId)";
            $stmt = $pdo->prepare($sql);
        
            // Binding dei parametri di input
            $stmt->bindParam(':mail', $mail, PDO::PARAM_STR);
            $stmt->bindParam(':nomeProgetto', $nomeProgetto, PDO::PARAM_STR);
            $stmt->bindParam(':testo', $testo, PDO::PARAM_STR);
            $stmt->bindParam(':dataCommento', $dataCommento, PDO::PARAM_STR);
        
            // Esecuzione della query
            $stmt->execute();
        
            // Recupero dell'ID generato
            $idResult = $pdo->query("SELECT @newId AS id")->fetch(PDO::FETCH_ASSOC);
        
            // Restituisci il risultato
            echo json_encode([
                "result" => "Commento aggiunto con successo",
                "comment_id" => $idResult['id']
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "[ERRORE] Query SQL non riuscita. Errore: " . $e->getMessage()]);
            exit();
        }        
    }else {
        http_response_code(401);
        echo json_encode(["error" => "jwtToken not valid"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "HTTP method not allowed"]);
}
?>
