<?php
    require_once 'config.php';
    require 'protected.php';
    require __DIR__ . '/../vendor/autoload.php';

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        if (isCreator()) {
            // Recupero i dati inviati dal client
            $data = json_decode(file_get_contents('php://input'), true);
            $competenza = $data["competenza"]; // Competenza
            $idProfilo = $data["idProfilo"]; // Id Profilo
            $livello = $data["livello"]; // Livello (0-5)

            // Validazione dei dati
            if (!is_string($competenza) || !is_int($idProfilo) || !is_int($livello) || $livello < 0 || $livello > 5) {
                http_response_code(400); // Bad Request
                echo json_encode(["error" => "Dati non validi."]);
                exit();
            }
            
            try {
                // Connessione al database
                $pdo = new PDO('mysql:host=' . servername . ';dbname=' . dbName, dbUsername, dbPassword);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $pdo->exec(mysqlCharachter);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => "[ERRORE] Connessione al DB non riuscita"]);
                exit();
            }

            try {
                // Preparing the SQL query to call the procedure
                $sql = "CALL popola_s_p(:competenza, :idProfilo, :livello)";
                $stmt = $pdo->prepare($sql);

                // Binding the input parameters
                $stmt->bindParam(':competenza', $competenza, PDO::PARAM_STR);
                $stmt->bindParam(':idProfilo', $idProfilo, PDO::PARAM_INT); // Assicurati che $inputNomeS sia un intero
                $stmt->bindParam(':livello', $livello, PDO::PARAM_INT);

                // Execute the query
                $stmt->execute();

                // If everything is fine, send a success response
                echo json_encode(["success" => "Competenze e livello aggiornati con successo."]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["error" => "[ERRORE] Query SQL non riuscita. Errore: " . $e->getMessage()]);
                exit();
            }
        } else {
            http_response_code(401);
            echo json_encode(["error" => "jwtToken not valid"]);
        }
    } else {
        http_response_code(405); // Method Not Allowed
        echo json_encode(["error" => "HTTP method not allowed"]);
    }
?>
