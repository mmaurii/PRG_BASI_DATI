<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
require  __DIR__ . '/../vendor/autoload.php';

function verifyJwtToken() : bool {
    require 'config.php';
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        echo json_encode(["error" => "No token provided"]);
        exit();
    }

    $token = str_replace("Bearer ", "", $headers['Authorization']);

    try {
        $decoded = JWT::decode($token, new Key($jwtKey, 'HS256'));
        return true;
    } catch (Exception $e) {
        return false;
    }
}
?>
