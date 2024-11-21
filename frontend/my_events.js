document.addEventListener('DOMContentLoaded', loadEvents);

let eventsData = []; // Global variable to store fetched events
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
                eventContainer.innerHTML = `<div class="border-main"><div class="border-item"><h8>You are not registered for any self-picking events.</h8></div></div>`;
                return;
            }

            // Store the fetched data in the global variable
            eventsData = data;

            // Display events
            displayEvents(eventsData);
        })
        .catch(error => {
            const eventContainer = document.getElementById('event-container');
            eventContainer.innerHTML = '<p>Failed to load events. Please try again later.</p>';
        });
}

function displayEvents(events) {
    const eventContainer = document.getElementById('event-container');
    eventContainer.innerHTML = ''; // Clear existing events

    events.forEach(event => {
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
}

function sortOrders(sortType) {
    // Remove the 'active' class from all filter buttons
    document.querySelectorAll('.filter-button').forEach(button => button.classList.remove('active'));

    // Add 'active' class to the clicked button
    document.getElementById(`sort-${sortType}`).classList.add('active');

    let sortedEvents = [...eventsData]; // Create a copy to sort

    switch (sortType) {
        case 'closest':
            sortedEvents.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
            break;
        case 'category-az':
            sortedEvents.sort((a, b) => a.category_name.localeCompare(b.category_name));
            break;
        case 'category-za':
            sortedEvents.sort((a, b) => b.category_name.localeCompare(a.category_name));
            break;
    }

    // Display sorted events
    displayEvents(sortedEvents);
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
