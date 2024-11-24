<?php
include 'db.php';

$categoryId = $_GET['category_id'];

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


$categoryInfo = getFullCategoryInfo($categoryId, $conn);
echo json_encode($categoryInfo);
$conn->close();
?>
