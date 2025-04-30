<?php
require_once 'config.php';
require 'protected.php';
require  __DIR__ . '/../vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "GET") {
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

    // Recupero del nome del progetto dai parametri della query
    $params = $_GET;
    if (isset($params['progetto'])) {
        $projectName = $params['progetto'];

        try {
            // Preparazione della query SQL per chiamare la stored procedure con il parametro
            $sql = "CALL getProjectByName(:progetto)";
            $stmt = $pdo->prepare($sql);

            $stmt->bindParam(':progetto', $projectName, PDO::PARAM_STR);

            $stmt->execute();

            $result = $stmt->fetch();

            $stmt->closeCursor();

            if ($result) {
                // Query per ottenere il totale finanziato dalla vista
                $sqlView = "SELECT totale_finanziato FROM TotaleFinanziamenti WHERE nome = :progetto";
                $stmtView = $pdo->prepare($sqlView);

                $stmtView->bindParam(':progetto', $projectName, PDO::PARAM_STR);

                $stmtView->execute();

                $resultView = $stmtView->fetch();

                if ($resultView) {
                    $result['totale_finanziato'] = $resultView['totale_finanziato'];
                } else {
                    $result['totale_finanziato'] = 0;
                }

                // Restituisce il risultato con il dato aggiunto in formato JSON
                echo json_encode(["result" => $result]);
            } else {
                echo json_encode(["error" => "Progetto non trovato"]);
            }
        } catch (PDOException $e) {
            // this should never happen, but just in case
            http_response_code(500);
            echo json_encode(["error" => "Query SQL non riuscita. Errore: " . $e->getMessage()]);
            exit();
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Parametro 'progetto' mancante."]);
        exit();
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Metodo HTTP non consentito"]);
}
