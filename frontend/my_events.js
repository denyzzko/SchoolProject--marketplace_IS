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
                eventContainer.innerHTML = `<div class=border-main><div class="border-item"><h8>You are not registered for any self-picking events.</h8></div></div>`;
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
                        <p><strong>Name:</strong> ${event.category_name}</p>
                        <button class="event-button" onclick="cancelOrder('${event.order_id}')">Cancel</button>
                    </div>
                `;
                eventContainer.appendChild(eventBox);
            });
        })
        .catch(error => {
            const eventContainer = document.getElementById('event-container');
            eventContainer.innerHTML = '<p>Failed to load events. Please try again later.</p>';
        });
}

let currentOrderId = null;

        function cancelOrder(orderId) {
            // Show the custom popup and store the order ID
            currentOrderId = orderId;
            document.getElementById('popup_cancel-overlay').style.display = 'flex';
        }

        function confirmCancel(isConfirmed) {
            // Hide the popup
            document.getElementById('popup_cancel-overlay').style.display = 'none';

            if (isConfirmed && currentOrderId !== null) {
                // Prepare data for POST request
                const formData = new FormData();
                formData.append('order_id', currentOrderId);

                // Send request to delete the order
                fetch('../backend/cancel_order.php', {
                    method: 'POST',
                    body: formData,
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            loadEvents(); // Reload events after successful deletion
                        } else {
                            alert('Failed to cancel order: ' + data.message);
                        }
                    })
                    .catch(error => {
                        alert('There was an error cancelling the order. Please try again later.');
                    });
            }
        }