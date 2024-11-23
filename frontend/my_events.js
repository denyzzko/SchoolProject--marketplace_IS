// Loads the events that the user is registered for by fetching data from the server
function loadEvents() {
    fetch('../backend/my_events.php')
        .then(response => response.json())
        .then(data => {
            const eventContainer = document.getElementById('event-container');
            eventContainer.innerHTML = '';

            if (data.error) {
                eventContainer.innerHTML = `<p>${data.error}</p>`;
                return;
            }

            if (data.length === 0) {
                eventContainer.innerHTML = `<div class="border-main"><div class="border-item"><h8>You are not registered for any self-picking events.</h8></div></div>`;
                return;
            }
            eventsData = data;
            displayEvents(eventsData);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            const eventContainer = document.getElementById('event-container');
            eventContainer.innerHTML = '<p>Failed to load events. Please try again later.</p>';
        });
}

// Displays the list of events in the event container element
function displayEvents(events) {
    const eventContainer = document.getElementById('event-container');
    eventContainer.innerHTML = '';

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

// Sorts the list of events based on the specified sorting type and updates the display
function sortOrders(sortType) {
    document.querySelectorAll('.filter-button').forEach(button => button.classList.remove('active'));
    document.getElementById(`sort-${sortType}`).classList.add('active');

    let sortedEvents = [...eventsData]; 

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

    displayEvents(sortedEvents);
}

let currentOrderId = null;

// Initiates the cancellation process for an event by showing a confirmation popup
function cancelOrder(orderId) {
    currentOrderId = orderId;
    document.getElementById('popup_cancel-overlay').style.display = 'flex';
}

// Handles the user's confirmation or cancellation of the event cancellation request
function confirmCancel(isConfirmed) {
    document.getElementById('popup_cancel-overlay').style.display = 'none';

    if (isConfirmed && currentOrderId !== null) {
        const formData = new FormData();
        formData.append('order_id', currentOrderId);

        fetch('../backend/cancel_order.php', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadEvents();
                } else {
                    alert('Failed to cancel order: ' + data.message);
                }
            })
            .catch(error => {
                alert('There was an error cancelling the order. Please try again later.');
            });
    }
}

// Load events when the page is loaded
document.addEventListener('DOMContentLoaded', loadEvents);
