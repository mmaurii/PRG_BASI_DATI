<?php
require 'config.php';
require  __DIR__ . '/../vendor/autoload.php';

/* $servername = "13.61.196.206";  // Usa "localhost" se il database è sulla stessa macchina
$dbUsername = "prova";         // Nome utente MySQL (modifica se necessario)
$dbPassword = "MyNewPass1!";   // Password dell'utente MySQL (se impostata)
$dbName = "BOSTARTER";  // Il nome del database */

// key for JWT connection
/* $jwtKey = bin2hex(random_bytes(32)); // Keep this secret!
 */
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$issuedAt = time();
$expirationTime = $issuedAt + 3600; // Token expires in 1 hour

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Recupero i dati inviati dal client
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data["mail"];
    $password = $data["password"];

    // Connessione al DB
    try {
        $pdo = new PDO('mysql:host='.$servername.';dbname='.$dbName, $dbUsername, $dbPassword);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
        echo ("[ERRORE] Connessione al DB non riuscita. Errore: " . $e->getMessage());
        exit();
    }


    try {
        // Preparing the SQL query to call the procedure with an output parameter
        $sql = "CALL logIn(:username, :password, @outputVar)";
        $stmt = $pdo->prepare($sql);

        // Binding the input parameters (username and password)
        $stmt->bindParam(':username', $username, PDO::PARAM_STR);
        $stmt->bindParam(':password', $password, PDO::PARAM_STR);

        // Execute the query
        $stmt->execute();

        // Now, retrieve the output parameter value
        $result = $pdo->query("SELECT @outputVar AS outputValue");
    } catch (PDOException $e) {
        echo ("[ERRORE] Query SQL non riuscita. Errore: " . $e->getMessage());
        exit();
    }

    $row = $result->fetch(PDO::FETCH_ASSOC);
    if ($row > 0) {
        if ($row['outputValue']) {
            $payload = [
                "iss" => "yourdomain.com",
                "aud" => "yourdomain.com",
                "iat" => $issuedAt,
                "exp" => $expirationTime,
                "user_id" => rand(1, 1000),
                "username" => $username
            ];

            $jwt = JWT::encode($payload, $jwtKey, 'HS256');

            echo json_encode(["token" => $jwt]);
        } else {
            echo json_encode(["error" => "Invalid credentials"]);
        }
    } else {
        echo json_encode(["error" => "User not found"]);
    }
}else {
    echo json_encode(["error" => "HTTP method not allowed"]);
}
?>