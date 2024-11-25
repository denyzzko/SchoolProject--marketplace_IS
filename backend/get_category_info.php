<?php
include 'db.php';
// Retrieve category_id from GET request
$categoryId = $_GET['category_id'];
// Function to retrieve the full hierarchical name and image path of a category
function getFullCategoryInfo($categoryId, $conn) {
    $nameParts = [];
    $currentId = $categoryId;
    $image_path = '';
     // Loop to traverse up category hierarchy
    while ($currentId) {
        // SQL statement to select the category details
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
    // Remove root category from name
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
