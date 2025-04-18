<?php
    require_once 'config.php';
    require 'protected.php';
    require  __DIR__ . '/../vendor/autoload.php';

    if($_SERVER["REQUEST_METHOD"] == "PUT") {
        if(isCreator()) {
            // Recupero i dati inviati dal client
            $data = json_decode(file_get_contents('php://input'), true);
            $inputId = $data["id"];
            $inputRisposta = $data["risposta"];

            try {
                $pdo = new PDO('mysql:host='.servername.';dbname='.dbName, dbUsername, dbPassword);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $pdo->exec(mysqlCharachter);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => "[ERRORE] Connessione al DB non riuscita"]);    
                exit();
            }

            try {
                // Preparing the SQL query to call the procedure with an output parameter
                $sql = "CALL addResponseToComment(:inputId, :inputRisposta)";
                $stmt = $pdo->prepare($sql);

                // Binding the input parameters
                $stmt->bindParam(':inputId', $inputId, PDO::PARAM_INT);
                $stmt->bindParam(':inputRisposta', $inputRisposta, PDO::PARAM_STR);

                // Execute the query
                $result = $stmt->execute();
                echo json_encode([
                    "success" => "risposta aggiunto con successo",
                    "result" => $result
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo ("[ERRORE] Query SQL non riuscita. Errore: " . $e->getMessage());
                exit();
            }
        }
        else {
            http_response_code(401);
            echo json_encode(["error" => "jwtToken not valid"]);
        }
    }
    else {
        http_response_code(405);
        echo json_encode(["error" => "HTTP method not allowed"]);
    }
?>