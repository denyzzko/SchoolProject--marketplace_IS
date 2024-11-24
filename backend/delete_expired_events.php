<?php
include 'db.php';


// Get the current date in the format "YYYY-MM-DD"
$currentDate = date('Y-m-d');

$sql = "
    DELETE Offer 
    FROM Offer 
    INNER JOIN SelfPickingEvent ON Offer.offer_id = SelfPickingEvent.offer_id
    WHERE SelfPickingEvent.end_date < ?";

$stmt = $conn->prepare($sql);
if ($stmt) {
    $stmt->bind_param('s', $currentDate);

    if ($stmt->execute()) {
        echo "Expired events have been deleted successfully.";
    } else {
        echo "Error executing the query: " . $stmt->error;
    }

    $stmt->close();
} else {
    echo "Error preparing the query: " . $conn->error;
}
?>
