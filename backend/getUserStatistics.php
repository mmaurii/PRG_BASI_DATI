<?php
require_once 'config.php';
require 'protected.php';
require  __DIR__ . '/../vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (verifyJwtToken()) {
        try {
            // Connessione al database
            $pdo = new PDO('mysql:host=' . servername . ';dbname=' . dbName, dbUsername, dbPassword);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $pdo->exec(mysqlCharachter);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "[ERRORE] Connessione al DB non riuscita"]);
            exit();
        }

        // Recupera i parametri dalla query string
        $mail = decodeJwt()['user_id'];

        try {
            // Preparazione della query SQL per chiamare la stored procedure con il parametro
            $sql = "CALL getUserStatistics(:mail)";
            $stmt = $pdo->prepare($sql);

            $stmt->bindParam(':mail', $mail, PDO::PARAM_STR);

            $stmt->execute();
            $result = [];
            
            // 1. Candidature
            if ($row = $stmt->fetch(PDO::FETCH_NUM)) {
                $result['nCandidature'] = $row[0];
            }

            // 2. Commenti
            if ($stmt->nextRowset() && $row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $result['nCommenti'] = $row['nCommenti'];
            }

            // 3. Finanziamenti
            if ($stmt->nextRowset() && $row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $result['totaleFinanziato'] = $row['totaleFinanziato'] ?? 0;
                $result['nFinanziamenti'] = $row['nFinanziamenti'] ?? 0;
            }

            // 4. Competenze
            if ($stmt->nextRowset() && $row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $result['nCompetenze'] = $row['nCompetenze'];
            }
        
            $stmt->closeCursor();

            echo json_encode(["result" => $result]);
        } catch (PDOException $e) {
            // this should never happen, but just in case
            http_response_code(500);
            echo json_encode(["error" => "Query SQL non riuscita. Errore: " . $e->getMessage()]);
            exit();
        }
    } else {
        http_response_code(401);
        echo json_encode(["error" => "jwtToken non valido"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Metodo HTTP non consentito"]);
}
