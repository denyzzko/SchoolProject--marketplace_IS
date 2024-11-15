<?php
include 'db.php';

$sql = "SELECT Offer.*, Attribute.origin, Attribute.date_of_harvest, Attribute.price_item, Attribute.price_kg 
        FROM Offer 
        JOIN Attribute ON Offer.offer_id = Attribute.offer_id";

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
