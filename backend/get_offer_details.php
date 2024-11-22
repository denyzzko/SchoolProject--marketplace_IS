<?php
include 'db.php';

$offer_id = $_GET['offer_id'];

// Funkce pro získání úplného názvu kategorie (bez kořene)
function getFullCategoryName($categoryId, $conn) {
    $nameParts = [];
    $currentId = $categoryId;

    while ($currentId) {
        $sql = "SELECT name, parent_category FROM Category WHERE category_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $currentId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            if (!$row['parent_category']) {
                // Pokud je to kořenová kategorie, přestaň přidávat názvy
                break;
            }
            array_unshift($nameParts, $row['name']); // Přidáme název na začátek pole
            $currentId = $row['parent_category'];
        } else {
            break;
        }

        $stmt->close();
    }

    $full_category_name = implode(' ', $nameParts);
    return $full_category_name;
}

$sql = "SELECT Offer.*, 
               Attribute.price_item, Attribute.price_kg, Attribute.origin, Attribute.date_of_harvest, Attribute.quantity AS attribute_quantity,
               SelfPickingEvent.location, SelfPickingEvent.start_date, SelfPickingEvent.end_date,
               Usr.name as farmer_name,
               Category.category_id as category_id
        FROM Offer
        LEFT JOIN Attribute ON Offer.offer_id = Attribute.offer_id
        LEFT JOIN SelfPickingEvent ON Offer.offer_id = SelfPickingEvent.offer_id
        INNER JOIN Category ON Offer.category_id = Category.category_id
        INNER JOIN Usr ON Offer.user_id = Usr.user_id
        WHERE Offer.offer_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $offer_id);
$stmt->execute();
$result = $stmt->get_result();

if($result->num_rows > 0) {
    $offer = $result->fetch_assoc();

    // Získáme úplný název kategorie
    $offer['category_name'] = getFullCategoryName($offer['category_id'], $conn);

    echo json_encode($offer);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Offer not found.']);
}

$stmt->close();
$conn->close();
?>
