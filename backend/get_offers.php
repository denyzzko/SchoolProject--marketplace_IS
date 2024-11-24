<?php
include 'db.php';

if (!$conn) {
    die(json_encode(['status' => 'error', 'message' => 'Database connection not established.']));
}

$type = isset($_GET['type']) ? $_GET['type'] : null;
$price_min = isset($_GET['price_min']) ? $_GET['price_min'] : null;
$price_max = isset($_GET['price_max']) ? $_GET['price_max'] : null;
$category_id = isset($_GET['category_id']) ? $_GET['category_id'] : null;
$farmer_id = isset($_GET['farmer_id']) ? $_GET['farmer_id'] : null;

$params = [];
$paramTypes = '';
$whereClauses = [];

if ($type) {
    $whereClauses[] = "Offer.type = ?";
    $params[] = $type;
    $paramTypes .= 's';
}

if ($price_min) {
    $whereClauses[] = "Attribute.price_kg >= ?";
    $params[] = $price_min;
    $paramTypes .= 'd';
}

if ($price_max) {
    $whereClauses[] = "Attribute.price_kg <= ?";
    $params[] = $price_max;
    $paramTypes .= 'd';
}

if ($category_id) {
    function getDescendantCategoryIds($parentId, $conn) {
        $ids = [$parentId];
        $sql = "SELECT category_id FROM Category WHERE parent_category = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $parentId);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $childId = $row['category_id'];
            $ids = array_merge($ids, getDescendantCategoryIds($childId, $conn));
        }
        $stmt->close();
        return $ids;
    }

    $categoryIds = getDescendantCategoryIds($category_id, $conn);
    $placeholders = implode(',', array_fill(0, count($categoryIds), '?'));
    $whereClauses[] = "Offer.category_id IN ($placeholders)";
    $params = array_merge($params, $categoryIds);
    $paramTypes .= str_repeat('i', count($categoryIds));
}

if ($farmer_id) {
    $whereClauses[] = "Usr.user_id = ?";
    $params[] = $farmer_id;
    $paramTypes .= 'i';
}

$sql = "SELECT Offer.*, 
               Attribute.price_item, Attribute.price_kg, Attribute.quantity AS attribute_quantity, Attribute.origin,
               SelfPickingEvent.location, SelfPickingEvent.start_date, SelfPickingEvent.end_date,
               Usr.name AS farmer_name, Usr.user_id AS farmer_id,
               Category.category_id AS category_id
        FROM Offer 
        LEFT JOIN Attribute ON Offer.offer_id = Attribute.offer_id
        LEFT JOIN SelfPickingEvent ON Offer.offer_id = SelfPickingEvent.offer_id
        JOIN Usr ON Offer.user_id = Usr.user_id
        JOIN Category ON Offer.category_id = Category.category_id";

if (count($whereClauses) > 0) {
    $sql .= ' WHERE ' . implode(' AND ', $whereClauses);
}
$sql .= " ORDER BY Offer.offer_id DESC";
$stmt = $conn->prepare($sql);

if ($stmt === false) {
    die(json_encode(['status' => 'error', 'message' => 'SQL prepare failed: ' . $conn->error]));
}

if (count($params) > 0) {
    $stmt->bind_param($paramTypes, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$offers = [];
if ($result && $result->num_rows > 0) {
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
