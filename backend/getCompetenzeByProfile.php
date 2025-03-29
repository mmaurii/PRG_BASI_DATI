<?php
require_once 'config.php';
require 'protected.php';
require  __DIR__ . '/../vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (true || verifyJwtToken()) {
        try {
            // Connessione al database
            $pdo = new PDO('mysql:host=' . servername . ';dbname=' . dbName, dbUsername, dbPassword, [PDO::ATTR_PERSISTENT => true]);
            $pdo->exec(mysqlCharachter);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "[ERRORE] Connessione al DB non riuscita"]);
            exit();
        }

        // Recupero del nome del progetto dai parametri della query
        $params = $_GET;
        if (isset($params['profilo'])) {
            $profilo = $params['profilo'];

            try {
                // Preparazione della query SQL per chiamare la stored procedure con il parametro
                $sql = "CALL getCompetenzeByProfile(:profilo)";
                $stmt = $pdo->prepare($sql);

                $stmt->bindParam(':profilo', $profilo, PDO::PARAM_INT);

                $stmt->execute();
                
                // Recupera tutti i risultati
                $results = $stmt->fetchAll();

                // Rispondi con JSON (bisogna ECHO)
                echo json_encode(["result" => $results]);

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
        http_response_code(401);
        echo json_encode(["error" => "jwtToken non valido"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Metodo HTTP non consentito"]);
}
