<?php
require_once 'config.php';
require 'protected.php';
require  __DIR__ . '/../vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (verifyJwtToken()) {
        // Recupero i dati inviati dal client

        try {
            $pdo = new PDO('mysql:host=' . servername . ';dbname=' . dbName, dbUsername, dbPassword);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $pdo->exec(mysqlCharachter);
        } catch (PDOException $e) {
                    return json_encode(["error" => "[ERRORE] Connessione al DB non riuscita. Errore: ".$e->getMessage()]);

            exit();
        }

        try {
            // Chiamiamo la stored procedure per ottenere tutte le competenze
            $sql = "CALL getCompetenze()";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();

            // Recuperiamo tutti le competenze
            $competenze = $stmt->fetchAll();
            $stmt->closeCursor();  // Chiudiamo il cursore della prima query per evitare conflitti

            // Restituiamo le competenze in formato JSON
            echo json_encode(["result" => $competenze]);

        } catch (PDOException $e) {
            echo json_encode(["error" => "Query SQL non riuscita. Errore: " . $e->getMessage()]);
            exit();
        }
    } else {
        http_response_code(401);
        echo json_encode(["error" => "jwtToken not valid"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "HTTP method not allowed"]);
}
