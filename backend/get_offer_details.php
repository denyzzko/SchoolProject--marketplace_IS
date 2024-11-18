<?php
include 'db.php';

$offer_id = $_GET['offer_id'];

$sql = "SELECT Offer.*, Attribute.*, Category.name as category_name
        FROM Offer
        INNER JOIN Attribute ON Offer.offer_id = Attribute.offer_id
        INNER JOIN Category ON Offer.category_id = Category.category_id
        WHERE Offer.offer_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $offer_id);
$stmt->execute();
$result = $stmt->get_result();

if($result->num_rows > 0) {
    $offer = $result->fetch_assoc();
    echo json_encode($offer);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Offer not found.']);
}

$stmt->close();
$conn->close();
?>
