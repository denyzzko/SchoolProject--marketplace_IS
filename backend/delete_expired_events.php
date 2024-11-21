<?php
include 'db.php';

//Assuming you already have the MySQLi connection $conn defined

// Get the current date in the format "YYYY-MM-DD"
$currentDate = date('Y-m-d');

// Prepare the SQL statement to delete expired events
$sql = "
    DELETE Offer 
    FROM Offer 
    INNER JOIN SelfPickingEvent ON Offer.offer_id = SelfPickingEvent.offer_id
    WHERE SelfPickingEvent.end_date < ?";

// Prepare the statement
$stmt = $conn->prepare($sql);
if ($stmt) {
    // Bind the current date as a parameter
    $stmt->bind_param('s', $currentDate);

    // Execute the statement
    if ($stmt->execute()) {
        echo "Expired events have been deleted successfully.";
    } else {
        echo "Error executing the query: " . $stmt->error;
    }

    // Close the statement
    $stmt->close();
} else {
    echo "Error preparing the query: " . $conn->error;
}

// Close the connection if needed
//$conn->close();
?>
