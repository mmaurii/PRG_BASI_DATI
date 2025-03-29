<?php
    require_once 'config.php';
    require 'protected.php';
    require_once 'logMongoDB.php';
    require  __DIR__ . '/../vendor/autoload.php';

    if($_SERVER["REQUEST_METHOD"] == "PUT") {
        if(verifyJwtToken()) {
            // Recupero i dati inviati dal client
            $data = json_decode(file_get_contents('php://input'), true);
            $mail = $data["mail"];
            $competenza = $data["competenze"];

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
                $isSuccess;
                foreach($competenza as $comp) {
                    $livello = $comp["livello"];
                    $competenza = $comp["competenza"];
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
                    
                    $text = "timeStamp: " . date('Y-m-d H:i:s').";mail: " . $mail . ";competenza: " . $competenza . ";queryType: INSERT;query: " . $sql . ";result: " . $isSuccess;
                    $resp = writeLog($text);
                }

                echo json_encode(["result"=>$isSuccess]);
            } catch (PDOException $e) {
                http_response_code(500);
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
        http_response_code(405);
        echo json_encode(["error" => "HTTP method not allowed"]);
    }
?>