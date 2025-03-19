<?php

use LDAP\Result;

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
        } catch (PDOException $e) {
            echo ("[ERRORE] Connessione al DB non riuscita. Errore: " . $e->getMessage());
            exit();
        }

        try {
            // Preparing the SQL query to call the procedure with an output parameter
            $sql = "CALL getProgetti()";
            $stmt = $pdo->prepare($sql);

            // Execute the query
            $stmt->execute();
            // Fetch all results
            $results = $stmt->fetchAll();

            echo json_encode(["result"=>$results]);
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
