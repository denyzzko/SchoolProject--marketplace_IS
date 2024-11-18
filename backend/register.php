<?php
session_start();
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // retrieve user inputs
    $name = htmlspecialchars(trim($_POST["name"]));
    $email = htmlspecialchars(trim($_POST["email"]));
    $password = password_hash(trim($_POST["password"]), PASSWORD_BCRYPT);
    $role = "registered";

    // check if email already exists in the database
    $sql = "SELECT * FROM Usr WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // email already exists
        echo "Email is already registered!";
    } else {
        // insert new user
        $sql = "INSERT INTO Usr (name, email, password, role) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssss", $name, $email, $password, $role);

        if ($stmt->execute()) {
            // successful registration (set session and redirect)
            $_SESSION["user_id"] = $conn->insert_id;
            $_SESSION["name"] = $name;
            $_SESSION["role"] = $role;

            header("Location: ../index.html");
            exit();
        } else {
            // error occured
            echo "Error: " . $conn->error;
        }
    }

    // close statement and connection
    $stmt->close();
    $conn->close();
}
?>
