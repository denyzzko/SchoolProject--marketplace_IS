// Get all orders for the logged in farmer
function fetchOrders() {
    fetch('../backend/get_orders.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                const sortedOrders = data.orders.sort((a, b) => b.order_id - a.order_id); // Sort orders
                renderOrders(sortedOrders);
                if (data.message) displayMessage("success-message", data.message, "success");
            } else {
                displayMessage("error-message", data.message, "error");
            }
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
            displayMessage("error-message", 'An unexpected error occurred.', "error");
        });
}

// Render orders
function renderOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = ''; // Clear existing orders

    if (orders.length === 0) {
        displayMessage("error-message", 'No orders available.', "error");
        return;
    }

    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
    
        orderElement.innerHTML = `
            <div class="order-details">
                <p><strong>Product:</strong> ${order.category_name}</p>
                <p><strong>Customer:</strong> ${order.customer_name}</p>
                <p><strong>Quantity:</strong> ${order.quantity} kg</p>
            </div>
            <div class="order-actions">
                <button class="accept-button" onclick="handleOrder(${order.order_id}, 'accept')">Accept</button>
                <button class="reject-button" onclick="handleOrder(${order.order_id}, 'reject')">Reject</button>
            </div>
        `;
    
        ordersList.appendChild(orderElement);
    });
}

// Accept or reject order
function handleOrder(orderId, action) {
    fetch('../backend/manage_orders.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id: orderId, action: action }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                fetchOrders(); // Refresh orders
            }
            displayMessage(data.status === "success" ? "success-message" : "error-message", data.message, data.status);
        })
        .catch(error => {
            console.error('Error handling order:', error);
            displayMessage("error-message", 'An unexpected error occurred.', "error");
        });
}

// Display success or error message
function displayMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with ID "${elementId}" not found.`);
        return;
    }
    element.textContent = message;
    element.style.color = type === "success" ? "green" : "red";
}

// Initialize orders on page load
document.addEventListener('DOMContentLoaded', fetchOrders);
