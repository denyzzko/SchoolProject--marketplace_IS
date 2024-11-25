<?php
include 'session_start.php';

header('Content-Type: application/json');

if (isset($_SESSION["user_id"])) {
    // If logged in, return info
    echo json_encode([
        "loggedIn" => true,
        "name" => $_SESSION["name"],
        "role" => $_SESSION["role"]
    ]);
} else {
    // Not logged in, return false
    echo json_encode(["loggedIn" => false]);
}
?>
