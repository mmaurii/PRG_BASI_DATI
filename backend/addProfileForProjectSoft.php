<?php
    require_once 'config.php';
    require 'protected.php';
    require  __DIR__ . '/../vendor/autoload.php';

    if($_SERVER["REQUEST_METHOD"] == "POST") {
        if(isCreator()) {
            // Recupero i dati inviati dal client
            $data = json_decode(file_get_contents('php://input'), true);
            $inputNome = $data["nomeProfilo"];
            $inputNomeS = $data["nomeProgetto"];

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
                // Prepara la query per chiamare la procedura con un parametro di uscita
                $sql = "CALL addProfileForProjectSoft(:inputNome, :inputNomeS, @outputProfileID)";
                $stmt = $pdo->prepare($sql);

                // Binding dei parametri di input
                $stmt->bindParam(':inputNome', $inputNome, PDO::PARAM_STR);
                $stmt->bindParam(':inputNomeS', $inputNomeS, PDO::PARAM_STR);

                // Esegui la query
                $stmt->execute();

                // Recupera l'ID del profilo appena creato
                $stmt = $pdo->query("SELECT @outputProfileID AS profileID");
                $result = $stmt->fetch(PDO::FETCH_ASSOC);

                // Aggiungi l'ID alla risposta
                echo json_encode(["success" => true, "profileID" => $result['profileID']]);
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
