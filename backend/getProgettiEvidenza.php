<?php
require_once 'config.php';
require 'protected.php';
require __DIR__ . '/../vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Recupero i dati inviati dal client
    try {
        $pdo = new PDO('mysql:host=' . servername . ';dbname=' . dbName, dbUsername, dbPassword);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->exec(mysqlCharachter);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "[ERRORE] Connessione al DB non riuscita"]);
        exit();
    }

    try {
        // Chiamiamo la vista viewClassificaProgettiAperti per ottenere i primi 3 progetti
        $sql = "SELECT * FROM viewClassificaProgettiAperti";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();

        // Recuperiamo i progetti dalla vista
        $progetti = $stmt->fetchAll();
        $stmt->closeCursor();  // Chiudiamo il cursore della query

        // Restituiamo i dati come JSON
        echo json_encode(["result" => $progetti]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Query SQL non riuscita. Errore: " . $e->getMessage()]);
        exit();
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "HTTP method not allowed"]);
}
