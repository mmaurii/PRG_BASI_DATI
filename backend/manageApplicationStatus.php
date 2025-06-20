<?php
require_once 'config.php';
require 'protected.php';
require __DIR__ . '/../vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "PUT") {
    if (isCreator()) {
        $payload = decodeJwt();
        $mailCreatore = $payload['username']; // Estratto dal token

        // Recupero i dati inviati dal client
        $data = json_decode(file_get_contents('php://input'), true);
        $inputMail = $data["nomeUtente"];
        $inputId = $data["idProfilo"];
        $inputStato = $data["statoCandidatura"];

        // Connessione al database
        try {
            $pdo = new PDO('mysql:host=' . servername . ';dbname=' . dbName, dbUsername, dbPassword);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->exec(mysqlCharachter);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "[ERRORE] Connessione al DB non riuscita"]);
            exit();
        }

        // Chiamata alla procedura con controllo della mail del creatore
        try {
            $sql = "CALL manageApplicationStatus(:inputMail, :inputId, :inputStato, :inputMailCreatore)";
            $stmt = $pdo->prepare($sql);

            $stmt->bindParam(':inputMail', $inputMail, PDO::PARAM_STR);
            $stmt->bindParam(':inputId', $inputId, PDO::PARAM_INT);
            $stmt->bindParam(':inputStato', $inputStato, PDO::PARAM_STR);
            $stmt->bindParam(':inputMailCreatore', $mailCreatore, PDO::PARAM_STR);

            $stmt->execute();

            echo json_encode(["success" => true]);
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
    http_response_code(405);
    echo json_encode(["error" => "HTTP method not allowed"]);
}
?>
