<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
require_once 'config.php';
require  __DIR__ . '/../vendor/autoload.php';

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
