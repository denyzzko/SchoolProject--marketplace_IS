<?php
session_start();

// Set inactivity timeout
$timeout = 600; // 10 minutes

if (isset($_SESSION['last_activity'])) {
    $elapsedTime = time() - $_SESSION['last_activity'];
    if ($elapsedTime > $timeout) {
        session_unset();
        session_destroy();
        echo json_encode(["status" => "error", "message" => "Session timed out. Please log in again."]);
        exit();
    }
}

$_SESSION['last_activity'] = time();
?>