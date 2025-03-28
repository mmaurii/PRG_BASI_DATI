<?php
require_once 'config.php';
require 'protected.php';
require  __DIR__ . '/../vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (true || verifyJwtToken()) {
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
            // Chiamiamo la stored procedure per ottenere tutti i progetti
            $sql = "CALL getProgetti()";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();

            // Recuperiamo tutti i progetti
            $progetti = $stmt->fetchAll();
            $stmt->closeCursor();  // Chiudiamo il cursore della prima query per evitare conflitti

            // Aggiungiamo il totale dei finanziamenti per ciascun progetto
            foreach ($progetti as &$progetto) {
                // Eseguiamo la query sulla vista per ottenere il totale dei finanziamenti
                $sqlTotaleFinanziato = "SELECT totale_finanziato FROM TotaleFinanziamenti WHERE nome = :nomeProgetto";
                $stmtTotale = $pdo->prepare($sqlTotaleFinanziato);
                $stmtTotale->bindParam(':nomeProgetto', $progetto['nome']);
                $stmtTotale->execute();
            
                // Recuperiamo il totale dei finanziamenti
                $totale = $stmtTotale->fetchColumn();
            
                // Se il valore è false o null, lo forziamo a 0
                $progetto['totale_finanziato'] = ($totale === false || $totale === null) ? 0 : $totale;
            
                $stmtTotale->closeCursor(); // Chiudiamo il cursore della query
            }                       

            // Restituiamo i progetti con il totale dei finanziamenti
            echo json_encode(["result" => $progetti]);

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
