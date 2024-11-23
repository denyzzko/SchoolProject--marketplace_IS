<?php
include 'db.php';

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


// Načtení nabídek
$sql = "SELECT Offer.*, 
               Attribute.price_item, Attribute.price_kg, Attribute.quantity AS attribute_quantity,
               SelfPickingEvent.location, SelfPickingEvent.start_date,
               Usr.name AS farmer_name, 
               Category.category_id AS category_id
        FROM Offer 
        LEFT JOIN Attribute ON Offer.offer_id = Attribute.offer_id
        LEFT JOIN SelfPickingEvent ON Offer.offer_id = SelfPickingEvent.offer_id
        JOIN Usr ON Offer.user_id = Usr.user_id
        JOIN Category ON Offer.category_id = Category.category_id";

$result = $conn->query($sql);

$offers = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $categoryInfo = getFullCategoryInfo($row['category_id'], $conn);
        $row['full_category_name'] = $categoryInfo['full_category_name'];
        $row['image_path'] = $categoryInfo['image_path'];
        $offers[] = $row;
    }
}

// Reverze pole nabídek (od nejnovějších po nejstarší)
$offers = array_reverse($offers);

echo json_encode($offers);
$conn->close();
?>
