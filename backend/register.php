<?php
include 'session_start.php';
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars(trim($_POST["name"]));
    $email = htmlspecialchars(trim($_POST["email"]));
    $password = password_hash(trim($_POST["password"]), PASSWORD_BCRYPT);
    $role = "registered";

    $sql = "SELECT * FROM Usr WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo "Email is already registered!";
    } else {
        $sql = "INSERT INTO Usr (name, email, password, role) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssss", $name, $email, $password, $role);

        if ($stmt->execute()) {
            $_SESSION["user_id"] = $conn->insert_id;
            $_SESSION["name"] = $name;
            $_SESSION["role"] = $role;

            header("Location: ../index.html");
            exit();
        } else {
            echo "Error: " . $conn->error;
        }
    }

    $stmt->close();
    $conn->close();
}
?>
