<?php
include 'db.php';
include 'session_start.php';

//Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

//Get user ID from session
$user_id = $_SESSION['user_id'];

//SQL query to get ratings,comments and category IDs
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
    //SQL query to get category name and parent category name
    $sql = "SELECT name, parent_category FROM Category WHERE category_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $categoryId);
    $stmt->execute();
    $result = $stmt->get_result();

    //Fetch category info
    if ($row = $result->fetch_assoc()) {
        if (in_array($row['name'], ['Fruit', 'Vegetable'])) {
            return '';
        }
        //If the category has no parent,return category name
        if (empty($row['parent_category'])) {
            return $row['name'];
        }
        //Get parent cateogry information
        $parentId = $row['parent_category'];
        $parentStmt = $conn->prepare($sql);
        $parentStmt->bind_param("i", $parentId);
        $parentStmt->execute();
        $parentResult = $parentStmt->get_result();

        //Fetch paretn category info
        if ($parentRow = $parentResult->fetch_assoc()) {
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

//Iteration over result and fetching reviews details
while ($row = $result->fetch_assoc()) {
    //Get full category name for each review
    $categoryInfo = getFullCategoryInfo($row['category_id'], $conn);
    $row['full_category_name'] = $categoryInfo;
    if (!empty($row['full_category_name'])) {
        $reviews[] = $row;
    }
}

$stmt->close();
$conn->close();

header('Content-Type: application/json');
echo json_encode($reviews);
?>
