<?php
include 'session_start.php';
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $user_id = $_SESSION["user_id"];
    $category_id = $_POST["category_id"];
    $type = $_POST["type"];

    if (empty($category_id) || empty($type) || !in_array($type, ['sale', 'selfpick'])) {
        echo json_encode(["status" => "error", "message" => "Invalid input data."]);
        exit();
    }

    $conn->begin_transaction();

    try {
        $sql_offer = "INSERT INTO Offer (user_id, category_id, type) VALUES (?, ?, ?)";
        $stmt_offer = $conn->prepare($sql_offer);
        $stmt_offer->bind_param("iis", $user_id, $category_id, $type);
        $stmt_offer->execute();
        $offer_id = $conn->insert_id;

        if ($type === 'sale') {
            $quantity = $_POST["quantity"];
            $origin = $_POST["origin"];
            $date_of_harvest = $_POST["date_of_harvest"];
            $price_item = $_POST["price_item"];
            $price_kg = $_POST["price_kg"];

            if (empty($quantity) || empty($origin) || empty($date_of_harvest) || empty($price_kg)) {
                throw new Exception("Invalid input data for sale offer.");
            }

            $sql_attribute = "INSERT INTO Attribute (offer_id, origin, date_of_harvest, price_item, price_kg, quantity) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt_attribute = $conn->prepare($sql_attribute);
            $stmt_attribute->bind_param("issddd", $offer_id, $origin, $date_of_harvest, $price_item, $price_kg, $quantity);
            $stmt_attribute->execute();

            $price = $price_kg;
            $sql_update_offer = "UPDATE Offer SET price = ?, quantity = ? WHERE offer_id = ?";
            $stmt_update_offer = $conn->prepare($sql_update_offer);
            $stmt_update_offer->bind_param("ddi", $price, $quantity, $offer_id);
            $stmt_update_offer->execute();
        } elseif ($type === 'selfpick') {
            $location = $_POST["location"];
            $start_date = $_POST["start_date"];
            $end_date = $_POST["end_date"];
            $price_kg = $_POST["price_kg"];
            $quantity = $_POST["quantity"];

            if (empty($location) || empty($start_date) || empty($end_date) || empty($price_kg) || empty($quantity)) {
                throw new Exception("Invalid input data for self-pick offer.");
            }

            $sql_selfpick = "INSERT INTO SelfPickingEvent (offer_id, location, start_date, end_date) VALUES (?, ?, ?, ?)";
            $stmt_selfpick = $conn->prepare($sql_selfpick);
            $stmt_selfpick->bind_param("isss", $offer_id, $location, $start_date, $end_date);
            $stmt_selfpick->execute();

            $origin = 'Czech Republic';
            $date_of_harvest = '1900-01-01';

            $sql_attribute = "INSERT INTO Attribute (offer_id, origin, date_of_harvest, price_kg, quantity) VALUES (?, ?, ?, ?, ?)";
            $stmt_attribute = $conn->prepare($sql_attribute);
            $stmt_attribute->bind_param("issdd", $offer_id, $origin, $date_of_harvest, $price_kg, $quantity);
            $stmt_attribute->execute();

            $price = $price_kg;
            $sql_update_offer = "UPDATE Offer SET price = ?, quantity = ? WHERE offer_id = ?";
            $stmt_update_offer = $conn->prepare($sql_update_offer);
            $stmt_update_offer->bind_param("ddi", $price, $quantity, $offer_id);
            $stmt_update_offer->execute();
        }

        $conn->commit();

        $roleChanged = false;
        if ($_SESSION['role'] === 'customer') {
            $sql_update_role = "UPDATE Usr SET role = 'farmer' WHERE user_id = ?";
            $stmt_update_role = $conn->prepare($sql_update_role);
            $stmt_update_role->bind_param("i", $user_id);
            $stmt_update_role->execute();
            $stmt_update_role->close();

            $_SESSION['role'] = 'farmer';

            $message = "Offer created successfully. You have now become a farmer.";
            $roleChanged = true;
        } else {
            $message = "Offer created successfully.";
        }

        echo json_encode([
            "status" => "success",
            "message" => $message,
            "offer_id" => $offer_id,
            "roleChanged" => $roleChanged
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["status" => "error", "message" => "Error occurred: " . $e->getMessage()]);
    } finally {
        $stmt_offer->close();
        if (isset($stmt_attribute)) $stmt_attribute->close();
        if (isset($stmt_update_offer)) $stmt_update_offer->close();
        if (isset($stmt_selfpick)) $stmt_selfpick->close();
        $conn->close();
    }
}
?>
