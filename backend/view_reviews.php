<?php
include 'db.php';
include 'session_start.php';

//Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

//Check if farmer ID is provided
if (!isset($_GET['farmer_id'])) {
    echo json_encode(['success' => false, 'message' => 'Farmer ID not provided']);
    exit;
}

$farmer_id = $_GET['farmer_id'];

//SQL query to get ratings,comments and category IDs 
$sql = "SELECT DISTINCT r.rating, r.comment, o.category_id
        FROM Review r
        JOIN Offer o ON r.offer_id = o.offer_id
        WHERE o.user_id = ?";

//Prepare SQL statement
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'SQL prepare error: ' . $conn->error]);
    exit;
}

//Bind farmer ID to the SQL statement
$stmt->bind_param("i", $farmer_id);
if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'SQL execute error: ' . $stmt->error]);
    exit;
}

$result = $stmt->get_result();
$reviews = [];

// Function to get full category info, excluding main categories "Fruit" and "Vegetable"
function getFullCategoryInfo($categoryId, $conn) {
    //SQL query to get category name and its parent category
    $sql = "SELECT name, parent_category FROM Category WHERE category_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $categoryId);
    $stmt->execute();
    $result = $stmt->get_result();

    //Fetch category info
    if ($row = $result->fetch_assoc()) {
        if (is_null($row['parent_category'])) {
            return '';
        }
        
        if (empty($row['parent_category'])) {
            return $row['name'];
        }
        
        //Get parent category info
        $parentId = $row['parent_category'];
        $parentStmt = $conn->prepare($sql);
        $parentStmt->bind_param("i", $parentId);
        $parentStmt->execute();
        $parentResult = $parentStmt->get_result();

        if ($parentRow = $parentResult->fetch_assoc()) {
            if (in_array($parentRow['name'], ['Fruit', 'Vegetable'])) {
                return $row['name'];
            } else {
                return $parentRow['name'] . ' ' . $row['name'];
            }
        }
        $parentStmt->close();
    }

    $stmt->close();
    return '';
}

//Iteration over the result and fetch review details
while ($row = $result->fetch_assoc()) {
    $categoryInfo = getFullCategoryInfo($row['category_id'], $conn);
    $row['full_category_name'] = $categoryInfo;
    //Only add reviews with not empty full category names
    if (!empty($row['full_category_name'])) {
        $reviews[] = $row;
    }
}

$stmt->close();
$conn->close();

//Output the reviews
header('Content-Type: application/json');
echo json_encode($reviews);
?>