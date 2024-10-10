<?php
session_start();
session_unset();  // Unset all session variables
session_destroy();  // Destroy the session

// Send a success message
echo json_encode(["status" => "success", "message" => "Logged out successfully."]);
exit();
?>

