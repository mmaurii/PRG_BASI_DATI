<?php
    require 'config.php';
    require 'protected.php';
    require  __DIR__ . '/../vendor/autoload.php';

    if($_SERVER["REQUEST_METHOD"] == "PUT") {
        if(verifyJwtToken()) {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = $data["id"];
            $reward = $data["reward"];
            $description = $data["description"];
            $price = $data["price"];
            $quantity = $data["quantity"];
            $image = $data["image"];

            try {
                $pdo = new PDO('mysql:host='.$servername.';dbname='.$dbName, $dbUsername, $dbPassword);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch (PDOException $e) {
                echo ("[ERRORE] Connessione al DB non riuscita. Errore: " . $e->getMessage());
                exit();
            }

            try {
                $sql = "UPDATE Rewards SET reward = :reward, description = :description, price = :price, quantity = :quantity, image = :image WHERE id = :id";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    'id' => $id,
                    'reward' => $reward,
                    'description' => $description,
                    'price' => $price,
                    'quantity' => $quantity,
                    'image' => $image
                ]);
                echo json_encode(["success" => true]);
            } catch (PDOException $e) {
                echo json_encode(["error" => "Errore nell'esecuzione della query."]);
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