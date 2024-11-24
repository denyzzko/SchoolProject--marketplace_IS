<?php
include 'db.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'farmer') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];

$searchTerm = isset($_GET['searchTerm']) ? strtolower(trim($_GET['searchTerm'])) : null;

// Function to get full category name and image_path
function getFullCategoryInfo($categoryId, $conn) {
    $nameParts = [];
    $currentId = $categoryId;
    $image_path = '';

    while ($currentId) {
        $sql = "SELECT name, parent_category, image_path FROM Category WHERE category_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $currentId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            array_unshift($nameParts, $row['name']);
            if (!$image_path && !empty($row['image_path'])) {
                $image_path = $row['image_path'];
            }
            $currentId = $row['parent_category'];
        } else {
            break;
        }

        $stmt->close();
    }

    if (count($nameParts) > 1) {
        array_shift($nameParts);
    }

    $name = implode(' ', $nameParts);

    return ['full_category_name' => $name, 'image_path' => $image_path];
}

$sql = "SELECT Offer.*, 
               Attribute.price_item, Attribute.price_kg, Attribute.quantity AS attribute_quantity, Attribute.origin,
               SelfPickingEvent.location, SelfPickingEvent.start_date, SelfPickingEvent.end_date,
               Usr.name AS farmer_name, 
               Category.category_id AS category_id
        FROM Offer 
        LEFT JOIN Attribute ON Offer.offer_id = Attribute.offer_id
        LEFT JOIN SelfPickingEvent ON Offer.offer_id = SelfPickingEvent.offer_id
        JOIN Usr ON Offer.user_id = Usr.user_id
        JOIN Category ON Offer.category_id = Category.category_id
        WHERE Offer.user_id = ?";

if ($searchTerm) {
    $sql .= " AND (
        LOWER(Usr.name) LIKE ? OR 
        LOWER(Category.name) LIKE ? OR 
        LOWER(Offer.type) LIKE ? OR 
        LOWER(Attribute.origin) LIKE ?
    )";
}

$sql .= " ORDER BY Offer.offer_id DESC";

$stmt = $conn->prepare($sql);

if ($searchTerm) {
    $searchTermWildcard = "%" . $searchTerm . "%";
    $stmt->bind_param("issss", $user_id, $searchTermWildcard, $searchTermWildcard, $searchTermWildcard, $searchTermWildcard);
} else {
    $stmt->bind_param("i", $user_id);
}

$stmt->execute();
$result = $stmt->get_result();

$offers = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $categoryInfo = getFullCategoryInfo($row['category_id'], $conn);
        $row['full_category_name'] = $categoryInfo['full_category_name'];
        $row['image_path'] = $categoryInfo['image_path'];
        $offers[] = $row;
    }
}

echo json_encode($offers);

$stmt->close();
$conn->close();
?>
