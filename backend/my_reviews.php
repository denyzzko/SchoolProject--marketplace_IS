<?php
include 'db.php';
include 'session_start.php';

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Get the reviews for offers made by the logged-in user
$sql = "SELECT DISTINCT r.rating, r.comment, o.category_id
        FROM Review r
        JOIN Offer o ON r.offer_id = o.offer_id
        WHERE o.user_id = ?";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'SQL prepare error: ' . $conn->error]);
    exit;
}

$stmt->bind_param("i", $user_id);
if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'SQL execute error: ' . $stmt->error]);
    exit;
}

$result = $stmt->get_result();
$reviews = [];

// Function to get full category info, excluding main categories "Fruit" and "Vegetable"
function getFullCategoryInfo($categoryId, $conn) {
    $sql = "SELECT name, parent_category FROM Category WHERE category_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $categoryId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // Skip main categories "Fruit" and "Vegetable"
        if (in_array($row['name'], ['Fruit', 'Vegetable'])) {
            return ''; // Skip main categories
        }
        
        // If the category has no parent, return the name
        if (empty($row['parent_category'])) {
            return $row['name'];
        }
        
        // Get the parent category name
        $parentId = $row['parent_category'];
        $parentStmt = $conn->prepare($sql);
        $parentStmt->bind_param("i", $parentId);
        $parentStmt->execute();
        $parentResult = $parentStmt->get_result();

        if ($parentRow = $parentResult->fetch_assoc()) {
            // Skip main categories for the parent as well
            if (!in_array($parentRow['name'], ['Fruit', 'Vegetable'])) {
                return $parentRow['name'] . ' ' . $row['name'];
            } else {
                return $row['name'];
            }
        }
        $parentStmt->close();
    }

    $stmt->close();
    return $row['name'];
}

while ($row = $result->fetch_assoc()) {
    $categoryInfo = getFullCategoryInfo($row['category_id'], $conn);
    $row['full_category_name'] = $categoryInfo;
    // If full_category_name is empty, skip adding this review
    if (!empty($row['full_category_name'])) {
        $reviews[] = $row;
    }
}

$stmt->close();
$conn->close();

header('Content-Type: application/json');
echo json_encode($reviews);
?>
