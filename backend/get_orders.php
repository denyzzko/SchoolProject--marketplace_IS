<?php
include 'session_start.php';
include 'db.php';

header('Content-Type: application/json');
// Check if user is logged in and has the farmer role
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'farmer') {
    echo json_encode(['status' => 'error', 'message' => 'You are not authorized to view orders.']);
    exit();
}

$farmerId = $_SESSION['user_id'];
// Function to retrieve the full category name without root
function getCategoryNameWithoutRoot($categoryId, $conn) {
    $nameParts = [];
    $currentId = $categoryId;
    // Traverse the category hierarchy
    while ($currentId) {
        // SQL query to fetch current category name and parent category
        $sql = "SELECT name, parent_category FROM Category WHERE category_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $currentId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            array_unshift($nameParts, $row['name']);
            $currentId = $row['parent_category'];
        } else {
            break;
        }

        $stmt->close();
    }
    // Remove the root category from the array
    if (count($nameParts) > 1) {
        array_shift($nameParts);
    }
    // Return as string
    return implode(' ', $nameParts);
}

try {
    // Fetch pending orders for the farmer
    $sql = "SELECT 
                o.order_id, 
                o.quantity, 
                u.name AS customer_name,
                c.category_id
            FROM Ordr o
            JOIN Offer off ON o.offer_id = off.offer_id
            JOIN Usr u ON o.user_id = u.user_id
            JOIN Category c ON off.category_id = c.category_id
            WHERE off.user_id = ? AND off.type = 'sale' AND o.status = 'pending'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $farmerId);
    $stmt->execute();
    $result = $stmt->get_result();
    // Array to store orders
    $orders = [];
    // Loop through each order and process its category name
    while ($row = $result->fetch_assoc()) {
        $row['category_name'] = getCategoryNameWithoutRoot($row['category_id'], $conn);
        $orders[] = $row;
    }
    // Return the fetched orders
    if (empty($orders)) {
        echo json_encode(['status' => 'error', 'message' => 'No orders available.', 'orders' => []]);
    } else {
        echo json_encode(['status' => 'success', 'orders' => $orders]);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch orders: ' . $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
