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
    $nome = $data["name"];
    $cognome = $data["surname"];
    $dataNascita = $data["anno"];
    $luogo = $data["luogo"];
    $nickname = $data["nickname"];

    // Connessione al DB
    try {
        $pdo = new PDO('mysql:host='.servername.';dbname='.dbName, dbUsername, dbPassword);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec(mysqlCharachter);
    } catch (PDOException $e) {
        echo json_encode(["error" => "[ERRORE] Connessione al DB non riuscita: " . $e->getMessage()]);
        exit();
    }

    try {
        // Esegui la procedura per verificare le credenziali
        $sql = "CALL singUp(:mail, :nickname, :password, :nome, :cognome, :anno, :luogo, @outputVar)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':mail', $mail, PDO::PARAM_STR);
        $stmt->bindParam(':password', $mail, PDO::PARAM_STR);
        $stmt->bindParam(':nome', $nome, PDO::PARAM_STR);
        $stmt->bindParam(':cognome', $cognome, PDO::PARAM_STR);
        $stmt->bindParam(':anno', $dataNascita, PDO::PARAM_INT);
        $stmt->bindParam(':luogo', $luogo, PDO::PARAM_STR);
        $stmt->bindParam(':nickname', $nickname, PDO::PARAM_STR);
        $stmt->execute();

        // Recupera il risultato della procedura
        $result = $pdo->query("SELECT @outputVar AS outputValue");
        $isSingUp = $result->fetch(PDO::FETCH_ASSOC)['outputValue'];

        $text = "timeStamp: " . date('Y-m-d H:i:s').";mail: " . $mail . ";queryType: INSERT;query: " . $sql . ";result: " . $result;
        $resp = writeLog($text);

        echo json_encode(["result"=>$isSingUp]);
    } catch (PDOException $e) {
        echo json_encode(["error" => "[ERRORE] Query SQL non riuscita: " . $e->getMessage()]);
        exit();
    }
}else {
    http_response_code(400);
    echo json_encode(["error" => "HTTP method not allowed"]);
}
?>
