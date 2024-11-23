<?php
include 'session_start.php';
include 'db.php';

header('Content-Type: application/json');

// Check if the user is logged in and is a farmer
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'farmer') {
    echo json_encode(['status' => 'error', 'message' => 'You are not authorized to view orders.']);
    exit();
}

$farmerId = $_SESSION['user_id'];

// Function to get the category name excluding the root
function getCategoryNameWithoutRoot($categoryId, $conn) {
    $nameParts = [];
    $currentId = $categoryId;

    while ($currentId) {
        $sql = "SELECT name, parent_category FROM Category WHERE category_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $currentId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            // Prepend the current category name
            array_unshift($nameParts, $row['name']);
            $currentId = $row['parent_category']; // Move to parent
        } else {
            break;
        }

        $stmt->close();
    }

    // Remove root category if present
    if (count($nameParts) > 1) {
        array_shift($nameParts);
    }

    // Join the remaining names
    return implode(' ', $nameParts);
}

try {
    // Query to fetch orders for the farmer
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

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        // Fetch the category name without the root
        $row['category_name'] = getCategoryNameWithoutRoot($row['category_id'], $conn);
        $orders[] = $row;
    }

    if (empty($orders)) {
        echo json_encode(['status' => 'success', 'message' => 'No orders available.', 'orders' => []]);
    } else {
        echo json_encode(['status' => 'success', 'orders' => $orders]);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch orders: ' . $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
