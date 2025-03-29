<?php
require_once 'config.php';
require_once 'logMongoDB.php';
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
    $year = $data["year"];
    $luogo = $data["city"];
    $nickname = $data["nickname"];
    $role = $data["role"];
    $secureCode = "";

    if($role == "admin"){
        $secureCode = $data["secureCode"];
    }

    // Connessione al DB
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
        // Esegui la procedura per verificare le credenziali
        $sql = "CALL signUp(:mail, :nickname, :password, :nome, :cognome, :anno, :luogo, :role, :secureCode, @outputVar)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':mail', $mail, PDO::PARAM_STR);
        $stmt->bindParam(':password', $password, PDO::PARAM_STR);
        $stmt->bindParam(':nome', $nome, PDO::PARAM_STR);
        $stmt->bindParam(':cognome', $cognome, PDO::PARAM_STR);
        $stmt->bindParam(':anno', $year, PDO::PARAM_INT);
        $stmt->bindParam(':luogo', $luogo, PDO::PARAM_STR);
        $stmt->bindParam(':nickname', $nickname, PDO::PARAM_STR);
        $stmt->bindParam(':role', $role, PDO::PARAM_STR);
        $stmt->bindParam(':secureCode', $secureCode, PDO::PARAM_STR);
        $stmt->execute();

        // Recupera il risultato della procedura
        $result = $pdo->query("SELECT @outputVar AS outputValue");
        $isSignUp = $result->fetch(PDO::FETCH_ASSOC)['outputValue'];

        $text = "timeStamp: " . date('Y-m-d H:i:s').";mail: " . $mail . ";queryType: INSERT;query: " . $sql . ";result: " . $isSignUp;
        $resp = writeLog($text);

        echo json_encode(["result"=>$isSignUp]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "[ERRORE] Query SQL non riuscita: " . $e->getMessage()]);
        exit();
    }
}else {
    http_response_code(405);
    echo json_encode(["error" => "HTTP method not allowed"]);
}
?>
