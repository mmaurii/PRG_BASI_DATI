<?php
require_once 'config.php';
require 'protected.php';
require  __DIR__ . '/../vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    try {
        // Connessione al database
        $pdo = new PDO('mysql:host=' . servername . ';dbname=' . dbName, dbUsername, dbPassword, [PDO::ATTR_PERSISTENT => true]);
        $pdo->exec(mysqlCharachter);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "[ERRORE] Connessione al DB non riuscita"]);
        exit();
    }

    $params = $_GET;

    if (isset($params['progetti']) && is_array($params['progetti'])) {
        $projects = $params['progetti'];
        $results = [];

        try {
            $sql = "CALL getFotoByProgetto(:progetto)";
            $stmt = $pdo->prepare($sql);

            foreach ($projects as $projectName) {
                $stmt->bindParam(':progetto', $projectName, PDO::PARAM_STR);
                $stmt->execute();
                $foto = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $stmt->closeCursor();

                $results[$projectName] = $foto;
            }

            echo json_encode(["result" => $results]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Query SQL non riuscita. Errore: " . $e->getMessage()]);
            exit();
        }

    } else {
        http_response_code(400);
        echo json_encode(["error" => "Parametro 'progetti' mancante o non valido. Deve essere un array."]);
        exit();
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Metodo HTTP non consentito"]);
}