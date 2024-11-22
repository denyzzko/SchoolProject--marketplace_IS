<?php
include 'db.php';

$categoryId = $_GET['category_id'];

// Funkce pro získání úplného názvu kategorie a image_path
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
            // Přidáme název kategorie na začátek pole
            array_unshift($nameParts, $row['name']);

            // Uložíme image_path, pokud ještě nemáme
            if (!$image_path && !empty($row['image_path'])) {
                $image_path = $row['image_path'];
            }

            $currentId = $row['parent_category'];
        } else {
            break;
        }

        $stmt->close();
    }

    // Odstraníme kořenovou kategorii
    if (count($nameParts) > 1) {
        array_shift($nameParts); // Odstraní první prvek (kořenovou kategorii)
    }

    // Sestavíme název kategorie bez kořenové kategorie
    $name = implode(' ', $nameParts);

    return ['full_category_name' => $name, 'image_path' => $image_path];
}


$categoryInfo = getFullCategoryInfo($categoryId, $conn);
echo json_encode($categoryInfo);
$conn->close();
?>
