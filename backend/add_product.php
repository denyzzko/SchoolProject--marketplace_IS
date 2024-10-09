<?php
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $product_name = $_POST["product_name"];
    $price = $_POST["price"];
    $quantity = $_POST["quantity"];
    $category_id = $_POST["category_id"];

    $sql = "INSERT INTO ProductListing (product_name, price, quantity, category_id) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sdii", $product_name, $price, $quantity, $category_id);

    if ($stmt->execute()) {
        echo "Product added successfully!";
    } else {
        echo "Error: " . $conn->error;
    }

    $stmt->close();
    $conn->close();
}
?>