<?php
require_once 'config.php';
require 'protected.php';
require  __DIR__ . '/../vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Recupero i dati inviati dal client
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

    // Verifica se il parametro 'progetto' è presente nei parametri GET
    if (isset($_GET['progetto'])) {
        $projectName = $_GET['progetto'];

        try {
            // Prepara la chiamata alla stored procedure con il parametro 'progetto'
            $sql = "CALL getCommentsByProgetto(:nome_progetto)";
            $stmt = $pdo->prepare($sql);

            // Bind del parametro 'nome_progetto'
            $stmt->bindParam(':nome_progetto', $projectName, PDO::PARAM_STR);

            // Esegui la query
            $stmt->execute();

            // Recupera tutti i risultati
            $results = $stmt->fetchAll();

            // Restituisci i risultati come JSON
            echo json_encode(["result" => $results]);
            
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Query SQL non riuscita. Errore: " . $e->getMessage()]);
            exit();
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Parametro 'progetto' mancante"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Metodo HTTP non consentito"]);
}
