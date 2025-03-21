<?php
require_once 'config.php';
require  __DIR__ . '/../vendor/autoload.php';

function writeLog($text): string
{
    try {
        // Connect to MongoDB
        $conn = new MongoDB\Client("mongodb://" . servername . ":27017");

        // Select database and collection
        $db = $conn->selectDatabase(dbName);
        $collection = $db->selectCollection("EVENTO");


        $document = array(
            "testo" => $text
        );

        // Insert document
        $result = $collection->insertOne($document);

        if ($result->getInsertedCount() == 1) {
            return json_encode(["result" => true]);
        } else {
            return json_encode(["result" => false]);
        }
    } catch (InvalidArgumentException $e) {
        return json_encode(["error" => "[ERRORE] I parametri di input sono sbagliati. Errore: " . $e->getMessage()]);
    } catch (Exception $e) {
        return json_encode(["error" => "[ERRORE] Connessione al DB non riuscita. Errore: " . $e->getMessage()]);
    }
}

?>