<?php
    require_once 'config.php';
    require 'protected.php';
    require  __DIR__ . '/../vendor/autoload.php';

    if($_SERVER["REQUEST_METHOD"] == "POST") {
        if(isCreator() || isCreatorAndAdmin()) {
            // Recupero i dati inviati dal client
            $data = json_decode(file_get_contents('php://input'), true);
            $inputNome = $data["nomeProfilo"];
            $inputNomeS = $data["nomeProgetto"];

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
                $sql = "CALL addProfileForProjectSoft(:inputNome, :inputNomeS)";
                $stmt = $pdo->prepare($sql);

                // Binding the input parameters
                $stmt->bindParam(':inputNome', $inputNome, PDO::PARAM_STR);
                $stmt->bindParam(':inputNomeS', $inputNomeS, PDO::PARAM_STR);

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