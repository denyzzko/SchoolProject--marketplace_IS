// Function to load orders and display them in the desired layout
function loadOrders() {
    fetch('../backend/my_orders.php')
        .then(response => response.json())
        .then(data => {
            renderOrders(data);
        })
        .catch(error => console.error('Error:', error));
}

// Function to render the orders in the container
function renderOrders(orders) {
    const orderContainer = document.getElementById('order-container');
    orderContainer.innerHTML = '';
    orders.forEach(order => {
        let statusClass = '';
        switch (order.status) {
            case 'pending':
                statusClass = 'status-pending';
                break;
            case 'confirmed':
                statusClass = 'status-confirmed';
                break;
            case 'rejected':
                statusClass = 'status-rejected';
                break;
        }

        const orderBox = document.createElement('div');
        orderBox.className = 'order-item';
        orderBox.innerHTML = `
            <div class="order-details">
                <div>
                    <p><strong>Name:</strong> ${order.full_category_name || 'Offer was deleted'}</p>
                    <p><strong>Farmer:</strong> ${order.farmer_name || 'Unknown'}</p>
                    <p>${order.price_kg ? order.price_kg + ' CZK/kg' : 'Price not available'}</p>
                    <p><strong>Bought:</strong> ${order.quantity}</p>
                    <p><strong>Type:</strong> ${order.type === 'sale' ? 'Sale' : 'Selfpick'}</p>
                    <p><strong>Date:</strong> ${order.date}</p>
                    <p><strong>Status:</strong> <span class="order-status ${statusClass}">${order.status}</span></p>
                    <div class="actions">
                        <button class="order-button" onclick="openPopup(${order.order_id}, '${order.full_category_name || 'Offer was deleted'}', '${order.farmer_name || 'Unknown'}')">Review</button>
                    </div>
                </div>
            </div>
        `;
        orderContainer.appendChild(orderBox);
    });
}


// Function to sort orders based on selected criteria
function sortOrders(criteria) {
    fetch('../backend/my_orders.php')
        .then(response => response.json())
        .then(data => {
            if (criteria === 'category-az') {
                data.sort((a, b) => a.category_name.localeCompare(b.category_name));
            } else if (criteria === 'category-za') {
                data.sort((a, b) => b.category_name.localeCompare(a.category_name));
            } else if (criteria === 'date-newest') {
                data.sort((a, b) => new Date(b.date) - new Date(a.date));
            } else if (criteria === 'date-oldest') {
                data.sort((a, b) => new Date(a.date) - new Date(b.date));
            }
            renderOrders(data); // Render the sorted orders

            // Update active button
            document.querySelectorAll('.filter-button').forEach(button => button.classList.remove('active'));
            document.getElementById(`sort-${criteria}`).classList.add('active');
        })
        .catch(error => console.error('Error sorting orders:', error));
}

// Load orders when the page is loaded
document.addEventListener('DOMContentLoaded', loadOrders);

// Function to open the review popup
function openPopup(orderId, full_category_name, farmerName) {
    document.getElementById('popup-header').textContent = `Review - ${full_category_name} from ${farmerName}`;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('review-popup').style.display = 'block';

    // Clear previous review and rating
    document.getElementById('review-text').value = '';
    document.getElementById('rating').value = 3;
    document.getElementById('review-popup').setAttribute('data-order-id', orderId);
}

// Function to close the review popup
function closePopup() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('review-popup').style.display = 'none';
}

// Function to send the review
function sendReview() {
    const reviewText = document.getElementById('review-text').value;
    const rating = document.getElementById('rating').value;
    const orderId = document.getElementById('review-popup').getAttribute('data-order-id');
    if (reviewText.trim() === '') {
        alert('Please write your review');
        return;
    }

    // Prepare data to send to the backend
    const reviewData = {
        order_id: orderId,
        rating: rating,
        comment: reviewText
    };

    // Send the review to the backend
    fetch('../backend/save_review.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closePopup();
        } else {
            alert('There was an error saving your review: ' + (data.message || 'Unknown error.'));
        }
    })
    
    .catch(error => {
        alert('There was an error saving your review. Please try again.');
    });
}

// Load orders when the page is loaded
document.addEventListener('DOMContentLoaded', loadOrders);


// Adding the rating slider to the popup
document.addEventListener('DOMContentLoaded', () => {
    const reviewPopup = document.getElementById('review-popup');
    const ratingContainer = document.createElement('div');
    ratingContainer.innerHTML = `
        <label for="rating">Rating:</label>
        <input type="range" id="rating" name="rating" min="1" max="5" value="3">
        <span id="rating-value">3</span>/5
    `;
    reviewPopup.insertBefore(ratingContainer, document.getElementById('review-text'));

    const ratingInput = document.getElementById('rating');
    const ratingValue = document.getElementById('rating-value');
    ratingInput.addEventListener('input', () => {
        ratingValue.textContent = ratingInput.value;
    });
});
