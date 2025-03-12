<?php
include 'config.php';
require 'vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    echo json_encode(["error" => "No token provided"]);
    exit();
}

$token = str_replace("Bearer ", "", $headers['Authorization']);

try {
    $decoded = JWT::decode($token, new Key($key, 'HS256'));
    echo json_encode(["message" => "Access granted", "user" => $decoded->username]);
} catch (Exception $e) {
    echo json_encode(["error" => "Invalid token"]);
}
?>
