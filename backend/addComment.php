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
            echo json_encode(["error" => "[ERRORE] Connessione al DB non riuscita. Errore: " . $e->getMessage()]);
            exit();
        }

        try {
            // Preparazione della query per chiamare la stored procedure
            $sql = "CALL addComment(:mail, :nomeProgetto, :testo, :dataCommento)";
            $stmt = $pdo->prepare($sql);

            // Binding dei parametri
            $stmt->bindParam(':mail', $mail, PDO::PARAM_STR);
            $stmt->bindParam(':nomeProgetto', $nomeProgetto, PDO::PARAM_STR);
            $stmt->bindParam(':testo', $testo, PDO::PARAM_STR);
            $stmt->bindParam(':dataCommento', $dataCommento, PDO::PARAM_STR);

            // Esecuzione della query
            $result = $stmt->execute();
            echo $result;
            echo json_encode(["success" => "Commento aggiunto con successo"]);
        } catch (PDOException $e) {
            echo json_encode(["error" => "[ERRORE] Query SQL non riuscita. Errore: " . $e->getMessage()]);
            exit();
        }
    }else {
        echo json_encode(["error" => "jwtToken not valid"]);
    }
} else {
    echo json_encode(["error" => "HTTP method not allowed"]);
}
?>
