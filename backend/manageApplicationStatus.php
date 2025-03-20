<?php
    require_once 'config.php';
    require 'protected.php';
    require  __DIR__ . '/../vendor/autoload.php';

    if($_SERVER["REQUEST_METHOD"] == "PUT") {
        if(isCreator() || isCreatorAndAdmin()) {
            // Recupero i dati inviati dal client
            $data = json_decode(file_get_contents('php://input'), true);
            $inputMail = $data["nomeUtente"];
            $inputId = $data["idProfilo"];
            $inputStato = $data["statoCandidatura"];

            try {
                $pdo = new PDO('mysql:host='.servername.';dbname='.dbName, dbUsername, dbPassword);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $pdo->exec(mysqlCharachter);
            } catch (PDOException $e) {
                echo ("[ERRORE] Connessione al DB non riuscita. Errore: " . $e->getMessage());
                exit();
            }

            try {
                // Preparing the SQL query to call the procedure with an output parameter
                $sql = "CALL manageApplicationStatus(:inputMail, :inputId, :inputStato)";
                $stmt = $pdo->prepare($sql);

                // Binding the input parameters
                $stmt->bindParam(':inputMail', $inputMail, PDO::PARAM_STR);
                $stmt->bindParam(':inputId', $inputId, PDO::PARAM_INT);
                $stmt->bindParam(':inputStato', $inputStato, PDO::PARAM_STR);

                // Execute the query
                $result = $stmt->execute();
                
                echo $result;
            } catch (PDOException $e) {
                echo ("[ERRORE] Query SQL non riuscita. Errore: " . $e->getMessage());
                exit();
            }
        }
        else {
            echo json_encode(["error" => "jwtToken not valid"]);
        }
    }
    else {
        echo json_encode(["error" => "HTTP method not allowed"]);
    }
?>