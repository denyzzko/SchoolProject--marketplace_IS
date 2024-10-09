<?php
session_start();
session_unset();  // Unset all session variables
session_destroy();  // Destroy the session

// Redirect the user to the login page after logging out
header("Location: ../frontend/login.html");
exit();
?>
