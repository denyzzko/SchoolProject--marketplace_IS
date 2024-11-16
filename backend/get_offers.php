<?php
include 'db.php';

$sql = "SELECT Offer.*, Attribute.price_item, Attribute.price_kg, Usr.name AS farmer_name 
        FROM Offer 
        JOIN Attribute ON Offer.offer_id = Attribute.offer_id
        JOIN Usr ON Offer.user_id = Usr.user_id";


$result = $conn->query($sql);

$offers = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $offers[] = $row;
    }
}

echo json_encode($offers);
$conn->close();
?>
