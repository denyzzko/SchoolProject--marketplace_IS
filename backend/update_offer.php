<?php
include 'db.php';
session_start();

//Check if user is logged in and is a farmer
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'farmer') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

//Get User and Offer ID from session and request
$user_id = $_SESSION['user_id'];
$offer_id = $_POST['offer_id'];

//SQL query to check offer ownership
$sql = "SELECT * FROM Offer WHERE offer_id = ? AND user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $offer_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Offer not found or unauthorized']);
    exit();
}

//Get type
$type = $_POST['type'];

$conn->begin_transaction();

try {
    if ($type === 'sale') {
        //Get sale details 
        $price_kg = $_POST['price_kg'];
        $quantity = $_POST['quantity'];
        $origin = $_POST['origin'];
        $date_of_harvest = $_POST['date_of_harvest'];

        //Update Attribute table with new sale details
        $sql = "UPDATE Attribute SET price_kg = ?, quantity = ?, origin = ?, date_of_harvest = ? WHERE offer_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ddssi", $price_kg, $quantity, $origin, $date_of_harvest, $offer_id);
        $stmt->execute();

        //Update Offer table with new price and quantity
        $sql = "UPDATE Offer SET price = ?, quantity = ? WHERE offer_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ddi", $price_kg, $quantity, $offer_id);
        $stmt->execute();

        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => 'Offer updated successfully']);
    } else if ($type === 'selfpick') {
        //Get self-pick details
        $location = $_POST['location'];
        $start_date = $_POST['start_date'];
        $end_date = $_POST['end_date'];
        $price_kg = $_POST['price_kg'];
        $quantity = $_POST['quantity'];

        //Update SelfPickingEvent table with new details
        $sql = "UPDATE SelfPickingEvent SET location = ?, start_date = ?, end_date = ? WHERE offer_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssi", $location, $start_date, $end_date, $offer_id);
        $stmt->execute();

        //Update Attribute table with new details
        $sql = "UPDATE Attribute SET price_kg = ?, quantity = ? WHERE offer_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ddi", $price_kg, $quantity, $offer_id);
        $stmt->execute();

        //Update Offer table with new price and quantity
        $sql = "UPDATE Offer SET price = ?, quantity = ? WHERE offer_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ddi", $price_kg, $quantity, $offer_id);
        $stmt->execute();

        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => 'Offer updated successfully']);
    } else {
        throw new Exception('Invalid offer type');
    }
} catch (Exception $e) {
    //Rollback in case of error
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => 'Failed to update offer: ' . $e->getMessage()]);
}

$conn->close();
?>
