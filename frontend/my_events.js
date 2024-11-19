document.addEventListener('DOMContentLoaded', loadEvents);

function loadEvents() {
    fetch('../backend/my_events.php')
        .then(response => response.json())
        .then(data => {
            const eventContainer = document.getElementById('event-container');
            eventContainer.innerHTML = ''; // Clear container before adding new events

            if (data.error) {
                eventContainer.innerHTML = `<p>${data.error}</p>`;
                return;
            }

            if (data.length === 0) {
                eventContainer.innerHTML = '<p>You are not registered for any self-picking events.</p>';
                return;
            }

            data.forEach(event => {
                const eventBox = document.createElement('div');
                eventBox.className = 'event-item';
                eventBox.innerHTML = `
                    <div class="event-details">
                        <p><strong>Location:</strong> ${event.location}</p>
                        <p><strong>From:</strong> ${event.start_date}</p>
                        <p><strong>To:</strong> ${event.end_date}</p>
                        <p><strong>Category Name:</strong> ${event.category_name}</p>
                        <button class="event-button" onclick="cancelOrder('${event.order_id}')">Cancel Order</button>
                    </div>
                `;
                eventContainer.appendChild(eventBox);
            });
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            const eventContainer = document.getElementById('event-container');
            eventContainer.innerHTML = '<p>Failed to load events. Please try again later.</p>';
        });
}

function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) {
        return;
    }

    // Prepare data for POST request
    const formData = new FormData();
    formData.append('order_id', orderId);

    // Send request to delete the order
    fetch('../backend/cancel_order.php', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            console.log('Response data:', data); // Log response for debugging
            if (data.success) {
                alert('Order successfully cancelled.');
                loadEvents(); // Reload events after successful deletion
            } else {
                alert('Failed to cancel order: ' + data.message);
                console.error('Error details:', data.message);
            }
        })
        .catch(error => {
            console.error('Error cancelling order:', error);
            alert('There was an error cancelling the order. Please try again later.');
        });
}
