<?php
    require_once 'config.php';
    require 'protected.php';
    require  __DIR__ . '/../vendor/autoload.php';

    if($_SERVER["REQUEST_METHOD"] == "POST") {
        if(verifyJwtToken()) {
            // Recupero i dati inviati dal client
            $data = json_decode(file_get_contents('php://input'), true);
            $mail = $data["mail"];
            $livello = $data["livello"];
            $competenza = $data["competenza"];

            try {
                $pdo = new PDO('mysql:host='.servername.';dbname='.dbName, dbUsername, dbPassword);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $pdo->exec("SET NAMES 'utf8mb4'");
            } catch (PDOException $e) {
                echo ("[ERRORE] Connessione al DB non riuscita. Errore: " . $e->getMessage());
                exit();
            }

            try {
                // Preparing the SQL query to call the procedure with an output parameter
                $sql = "CALL setLivelloCompetenza(:livello, :competenza, :mail, @isSet)";
                $stmt = $pdo->prepare($sql);

                // Binding the input parameters
                $stmt->bindParam(':livello', $livello, PDO::PARAM_INT);
                $stmt->bindParam(':competenza', $competenza, PDO::PARAM_STR);
                $stmt->bindParam(':mail', $mail, PDO::PARAM_STR);
                
                // Execute the query
                $result = $stmt->execute();

                // Recupera il valore dell'output della procedura
                $result = $pdo->query("SELECT @isSet AS isSuccess");
                $isSuccess = $result->fetch(PDO::FETCH_ASSOC)['isSuccess'];

                echo json_encode(["result"=>$isSuccess]);
            } catch (PDOException $e) {
                echo json_encode(["error" => "[ERRORE] Query SQL non riuscita. Errore: " . $e->getMessage()]);
                exit();
            }
        }
        else {
            http_response_code(401);
            echo json_encode(["error" => "jwtToken not valid"]);
        }
    }
    else {
        http_response_code(400);
        echo json_encode(["error" => "HTTP method not allowed"]);
    }
?>