<?php
require_once 'config.php';
require 'protected.php';
require  __DIR__ . '/../vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (true || verifyJwtToken()) {
        try {
            // Connessione al database
            $pdo = new PDO('mysql:host=' . servername . ';dbname=' . dbName, dbUsername, dbPassword);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $pdo->exec(mysqlCharachter);
        } catch (PDOException $e) {
                    return json_encode(["error" => "[ERRORE] Connessione al DB non riuscita. Errore: ".$e->getMessage()]);

            exit();
        }

        // Recupero del nome del progetto dai parametri della query
        $params = $_GET;
        if (isset($params['progetto'])) {
            $projectName = $params['progetto'];

            try {
                // Preparazione della query SQL per chiamare la stored procedure con il parametro
                $sql = "CALL getFotoByProgetto(:progetto)";
                $stmt = $pdo->prepare($sql);

                $stmt->bindParam(':progetto', $projectName, PDO::PARAM_STR);

                $stmt->execute();
                
                // Recupera tutti i risultati
                $results = $stmt->fetchAll();

                foreach ($results as &$row) {
                    foreach ($row as $key => $value) {
                        if (is_resource($value) || is_string($value)) {
                            $row[$key] = base64_encode($value);
                        }
                    }
                }
                
                $jsonOutput = json_encode(["result" => $results], JSON_UNESCAPED_UNICODE);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    die(json_encode(["error" => "Errore nella codifica JSON: " . json_last_error_msg()]));
                }
                echo $jsonOutput;

            } catch (PDOException $e) {
                echo json_encode(["error" => "Query SQL non riuscita. Errore: " . $e->getMessage()]);
                exit();
            }
        } else {
            echo json_encode(["error" => "Parametro 'progetto' mancante."]);
            exit();
        }
    } else {
        http_response_code(401);
        echo json_encode(["error" => "jwtToken non valido"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Metodo HTTP non consentito"]);
}
