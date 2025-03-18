<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
require_once 'config.php';
require  __DIR__ . '/../vendor/autoload.php';

function decodeJwt($jwt) {
    try {
        // Decodifica il JWT e verifica la firma
        $decoded = JWT::decode($jwt, new Key(JWTKEY, 'HS256'));
        return (array) $decoded;  // Restituisce il payload come array associativo
    } catch (Exception $e) {
        // Se la firma non è valida o il token è scaduto, restituisce un errore
        echo 'Token invalido o scaduto: ' . $e->getMessage();
        return null;
    }
}
function isCreator() {
    $headers = getallheaders();
    $jwt = json_decode(str_replace("Bearer ", "", $headers['Authorization']), true)['token'];
    $decoded = decodeJwt($jwt);
    if ($decoded && isset($decoded['ruolo']) && $decoded['ruolo'] === 'creator') {
        return true;
    }
    return false;
}
function isCreatorAndAdmin() {
    $headers = getallheaders();
    $jwt = json_decode(str_replace("Bearer ", "", $headers['Authorization']), true)['token'];
    $decoded = decodeJwt($jwt);
    if ($decoded && isset($decoded['ruolo']) && $decoded['ruolo'] === 'admin_creator') {
        return true;
    }
    return false;
}
function isAdmin() {
    $headers = getallheaders();
    $jwt = json_decode(str_replace("Bearer ", "", $headers['Authorization']), true)['token'];
    $decoded = decodeJwt($jwt);
    if ($decoded && isset($decoded['ruolo']) && $decoded['ruolo'] === 'admin') {
        return true;
    }
    return false;
}


function verifyJwtToken() : bool {
    header("Content-Type: application/json"); // Ensure JSON response

    $headers = getallheaders();
    error_log(print_r($headers, true)); // Log headers for debugging

    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized - No token provided"]);
        exit();
    }

    $token = json_decode(str_replace("Bearer ", "", $headers['Authorization']), true)['token'];

    try {
        $decoded = JWT::decode($token, new Key(JWTKEY, 'HS256'));
        return true;
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(["error" => "Invalid or expired token: ".$e->getMessage()]);
        exit();
    }
}
?>