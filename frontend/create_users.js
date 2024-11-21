function displayMessage(element, message, type) {
    element.textContent = message;
    element.style.color = type === "success" ? "green" : "red";
}

// Submit creation of user
function submitCreateUser() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const errorMessageElement = document.getElementById('error-message');
    const successMessageElement = document.getElementById('success-message');

    // Reset messages
    errorMessageElement.textContent = '';
    successMessageElement.textContent = '';

    if (!name || !email || !password || !role) {
        displayMessage(errorMessageElement, 'All fields are required.', 'error');
        return;
    }

    fetch('../backend/create_users.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                displayMessage(successMessageElement, data.message, 'success');
                document.getElementById('create-user-form').reset();
            } else {
                displayMessage(errorMessageElement, data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            displayMessage(errorMessageElement, 'An unexpected error occurred.', 'error');
        });
}