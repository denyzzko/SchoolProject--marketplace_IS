<?php
session_start();
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Získat a validovat vstupní data
    $user_id = $_SESSION["user_id"];
    $category_id = $_POST["category_id"];
    $type = $_POST["type"];
    $price = $_POST["price"];
    $quantity = $_POST["quantity"];
    $origin = $_POST["origin"];
    $date_of_harvest = $_POST["date_of_harvest"];
    $price_item = $_POST["price_item"];
    $price_kg = $_POST["price_kg"];

    if (empty($category_id) || empty($type) || !in_array($type, ['sale', 'selfpick']) ||
        empty($quantity) || empty($origin) || empty($date_of_harvest)) {
        echo json_encode(["status" => "error", "message" => "Invalid input data."]);
        exit();
    }

    // Začít transakci
    $conn->begin_transaction();

    try {
        // Vložit do tabulky Offer
        $sql_offer = "INSERT INTO Offer (user_id, category_id, type, price, quantity) VALUES (?, ?, ?, ?, ?)";
        $stmt_offer = $conn->prepare($sql_offer);
        $stmt_offer->bind_param("iissd", $user_id, $category_id, $type, $price, $quantity);
        $stmt_offer->execute();
        $offer_id = $conn->insert_id;

        // Vložit do tabulky Attribute
        $sql_attribute = "INSERT INTO Attribute (offer_id, origin, date_of_harvest, price_item, price_kg, quantity) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt_attribute = $conn->prepare($sql_attribute);
        $stmt_attribute->bind_param("issdii", $offer_id, $origin, $date_of_harvest, $price_item, $price_kg, $quantity);
        $stmt_attribute->execute();

        // Potvrdit transakci
        $conn->commit();

        echo json_encode(["status" => "success", "message" => "Offer created successfully."]);
    } catch (Exception $e) {
        // Vrátit transakci
        $conn->rollback();
        echo json_encode(["status" => "error", "message" => "Error occurred: " . $e->getMessage()]);
    } finally {
        $stmt_offer->close();
        $stmt_attribute->close();
        $conn->close();
    }
}
?>
