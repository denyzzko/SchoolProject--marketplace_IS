// Display messages
function displayMessage(element, message, type) {
    element.textContent = message;
    element.style.color = type === "success" ? "green" : "red";
}

// Search for a user
function searchUser() {
    const email = document.getElementById('search-user').value;
    const errorMessageElement = document.getElementById('error-message');
    const successMessageElement = document.getElementById('success-message');
    const userInfoElement = document.getElementById('user-info');

    // Clear previous messages and user info
    errorMessageElement.textContent = '';
    successMessageElement.textContent = '';
    userInfoElement.style.display = 'none';

    fetch(`../backend/manage_users.php?action=search&email=${encodeURIComponent(email)}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                // Populate user information
                userInfoElement.style.display = 'block';
                document.getElementById('user-name').value = data.user.name;
                document.getElementById('user-email').value = data.user.email;
                document.getElementById('user-role').value = data.user.role;
            } else {
                // Display error message
                displayMessage(errorMessageElement, data.message, "error");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            displayMessage(errorMessageElement, 'An unexpected error occurred. Please try again later.', "error");
        });
}

// Update user
function updateUser() {
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const role = document.getElementById('user-role').value;
    const errorMessageElement = document.getElementById('error-message');
    const successMessageElement = document.getElementById('success-message');
    const userInfoElement = document.getElementById('user-info');

    fetch('../backend/manage_users.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'update', email, name, role }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                // Display success message and hide user info
                displayMessage(successMessageElement, data.message, "success");
                userInfoElement.style.display = 'none';
            } else {
                displayMessage(errorMessageElement, data.message, "error");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            displayMessage(errorMessageElement, 'An unexpected error occurred. Please try again later.', "error");
        });
}

// Delete user
function deleteUser() {
    const email = document.getElementById('user-email').value;
    const errorMessageElement = document.getElementById('error-message');
    const successMessageElement = document.getElementById('success-message');
    const userInfoElement = document.getElementById('user-info');

    if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
        fetch('../backend/manage_users.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'delete', email }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    displayMessage(successMessageElement, data.message, "success");
                    userInfoElement.style.display = 'none';
                } else {
                    displayMessage(errorMessageElement, data.message, "error");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                displayMessage(errorMessageElement, 'An unexpected error occurred. Please try again later.', "error");
            });
    }
}
