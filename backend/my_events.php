<?php
include 'db.php';
include 'session_start.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

$category_id = isset($_GET['category_id']) ? $_GET['category_id'] : null;

// Function to get all child category IDs for a given category ID
function getChildCategoryIds($parentId, $conn) {
    $categoryIds = [];
    $sql = "SELECT category_id FROM Category WHERE parent_category = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $parentId);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $categoryIds[] = $row['category_id'];
        $categoryIds = array_merge($categoryIds, getChildCategoryIds($row['category_id'], $conn));
    }
    $stmt->close();
    return $categoryIds;
}

$sql = "SELECT e.event_id, e.offer_id, e.location, e.start_date, e.end_date, c.category_id, o2.order_id
        FROM SelfPickingEvent e
        JOIN Offer o ON e.offer_id = o.offer_id
        JOIN Ordr o2 ON o2.offer_id = o.offer_id
        JOIN Category c ON o.category_id = c.category_id
        WHERE o2.user_id = ? AND o.type = 'selfpick'";

// Add category filter if it is provided
$params = ["i", $user_id];
if ($category_id) {
    $childCategoryIds = getChildCategoryIds($category_id, $conn);
    $childCategoryIds[] = $category_id;
    $placeholders = implode(',', array_fill(0, count($childCategoryIds), '?'));
    $sql .= " AND c.category_id IN ($placeholders)";
    $params[0] .= str_repeat("i", count($childCategoryIds));
    $params = array_merge($params, $childCategoryIds);
}

$stmt = $conn->prepare($sql);
if (!$stmt) {
    error_log('SQL prepare error: ' . $conn->error);
    echo json_encode(['error' => 'Server error, please try again later.']);
    exit;
}

$stmt->bind_param(...$params);
if (!$stmt->execute()) {
    error_log('SQL execute error: ' . $stmt->error);
    echo json_encode(['error' => 'Server error, please try again later.']);
    exit;
}

$result = $stmt->get_result();
if (!$result) {
    error_log('SQL result error: ' . $stmt->error);
    echo json_encode(['error' => 'Server error, please try again later.']);
    exit;
}

// Function to get full category info, excluding main categories "Fruit" and "Vegetable"
function getFullCategoryInfo($categoryId, $conn) {
    $sql = "SELECT name, parent_category FROM Category WHERE category_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $categoryId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if (is_null($row['parent_category'])) {
            return '';
        }
        
        if (empty($row['parent_category'])) {
            return $row['name'];
        }
        
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

$events = array();
while ($row = $result->fetch_assoc()) {
    $categoryInfo = getFullCategoryInfo($row['category_id'], $conn);
    $row['full_category_name'] = $categoryInfo;
    if (!empty($row['full_category_name'])) {
        $events[] = $row;
    }
}

$stmt->close();
$conn->close();

header('Content-Type: application/json');
echo json_encode($events);
?>