<?php
require_once 'config.php';
require  __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$issuedAt = time();
// Token expires in 1 hour
$expirationTime = $issuedAt + 3600; 

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Recupero i dati inviati dal client
    $data = json_decode(file_get_contents('php://input'), true);
    $mail = $data["mail"];
    $password = $data["password"];

    // Connessione al DB
    try {
        $pdo = new PDO('mysql:host='.servername.';dbname='.dbName, dbUsername, dbPassword);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec(mysqlCharachter);
        $pdo->exec(mysqlCharachter);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "[ERRORE] Connessione al DB non riuscita"]);
        exit();
    }

    try {
        // Esegui la procedura per verificare le credenziali
        $sql = "CALL logIn(:mail, :password, @outputVar)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':mail', $mail, PDO::PARAM_STR);
        $stmt->bindParam(':password', $password, PDO::PARAM_STR);
        $stmt->execute();

        // Recupera il risultato della procedura
        $result = $pdo->query("SELECT @outputVar AS outputValue");
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "[ERRORE] Query SQL non riuscita: " . $e->getMessage()]);
        exit();
    }

    $row = $result->fetch(PDO::FETCH_ASSOC);

    if ($row && $row['outputValue']) {
        try {
            // Chiama la procedura per ottenere il ruolo dell'utente
            $stmt = $pdo->prepare("CALL getUserRole(:mail, @userRole)");
            $stmt->bindParam(':mail', $mail, PDO::PARAM_STR);
            $stmt->execute();
        
            // Recupera il valore dell'output della procedura
            $result = $pdo->query("SELECT @userRole AS ruolo");
            $userRole = $result->fetch(PDO::FETCH_ASSOC)['ruolo'];
        
            // Genera il token JWT con il ruolo dell'utente
            $payload = [
                "iss" => "bostarter.com",
                "aud" => "bostarter.com",
                "iat" => $issuedAt,
                "exp" => $expirationTime,
                "user_id" => $mail,
                "username" => $mail,
                "ruolo" => $userRole 
            ];
        
            $jwtToken = JWT::encode($payload, JWTKEY, 'HS256');
        
            echo json_encode(["token" => $jwtToken]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "[ERRORE] Impossibile ottenere il ruolo: " . $e->getMessage()]);
            exit();
        }        
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Invalid credentials"]);
    }
}else {
    http_response_code(400);
    echo json_encode(["error" => "HTTP method not allowed"]);
}
?>
