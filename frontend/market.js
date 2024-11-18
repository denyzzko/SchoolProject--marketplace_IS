// Dynamically check role and show "Create Offer" section for farmers
fetch('../backend/index.php')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn && data.role === 'farmer') {
            document.getElementById('create-offer-section').style.display = 'block';
        }
    })
    .catch(error => console.error('Error:', error));

// Funkce pro otevření modálního okna
document.getElementById('create-offer-btn').addEventListener('click', function() {
    document.getElementById('createOfferModal').style.display = 'block';
});

// Funkce pro zavření modálního okna
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('createOfferModal').style.display = 'none';
});

// Zavřít modální okno při kliknutí mimo obsah
window.onclick = function(event) {
    const modal = document.getElementById('createOfferModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// Odeslání formuláře pro vytvoření nabídky - pouze tlačítko uvnitř modálu
document.getElementById('submitOfferForm').addEventListener('click', function () {
    const formData = new FormData(document.getElementById('create-offer-form'));

    fetch('../backend/create_offer.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            document.getElementById('createOfferModal').style.display = 'none';
            addOfferToMarket(formData); // Dynamicky přidá nabídku na tržiště
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});

// Funkce pro dynamické přidání nabídky do tržiště
function addOfferToMarket(data) {
    const marketContainer = document.getElementById('market-container');
    const offerBox = document.createElement('div');
    offerBox.className = 'grid-item';
    offerBox.innerHTML = `
        <div class="offer-title">Category ID: ${data.get('category_id')}</div>
        <p><strong>Type:</strong> ${data.get('type')}</p>
        <p><strong>Price:</strong> <span class="price">${data.get('price')} Kč</span></p>
        <p><strong>Quantity:</strong> ${data.get('quantity')}</p>
        <p><strong>Origin:</strong> ${data.get('origin')}</p>
        <p><strong>Date of Harvest:</strong> ${data.get('date_of_harvest')}</p>
        <div class="button-container">
            <button>View Details</button>
        </div>
    `;
    marketContainer.appendChild(offerBox);
}

// Načtení existujících nabídek z databáze
window.addEventListener('DOMContentLoaded', () => {
    fetch('../backend/get_offers.php')
        .then(response => response.json())
        .then(data => {
            const marketContainer = document.getElementById('market-container');
            marketContainer.innerHTML = ''; // Vyčistíme obsah před přidáním nových nabídek
            data.forEach(offer => {
                const offerBox = document.createElement('div');
                offerBox.className = 'grid-item';
                offerBox.innerHTML = `
                    <div class="top-section"></div>
                    <div class="middle-section">${offer.type === 'sale' ? 'Sale' : 'Selfpick'}</div>
                    <div class="bottom-section">
                        <div>
                            <p><strong>Name:</strong> ${offer.category_id}</p>
                            <p><strong>Farmer:</strong> ${offer.farmer_name}</p>
                            <p>${offer.price_item} CZK</p>
                            <p>${offer.price_kg} CZK/kg</p>
                        </div>
                        <div>
                            <p><strong>Remains:</strong> ${offer.quantity}</p>
                            <div class="actions">
                                <button class="button">Porovnat cenu</button>
                            </div>
                        </div>
                    </div>
                `;
                offerBox.addEventListener('click', function () {
                    const sidebar = document.getElementById('offer-detail-sidebar');
                    if (sidebar.classList.contains('open')) {
                        // Panel je otevřený, jen aktualizujte informace
                        openOfferSidebar(offer.offer_id);
                    } else {
                        // Panel není otevřený, otevřete ho a načtěte informace
                        openOfferSidebar(offer.offer_id);
                        sidebar.classList.add('open');
                    }
                });
                marketContainer.appendChild(offerBox);
            });
        })
        .catch(error => console.error('Error:', error));
});


// Search button click event
document.getElementById('search-button').addEventListener('click', function () {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const offers = document.querySelectorAll('.grid-item');

    offers.forEach(offer => {
        const offerText = offer.textContent.toLowerCase();
        if (offerText.includes(searchTerm)) {
            offer.style.display = 'grid'; // Restore original display
        } else {
            offer.style.display = 'none'; // Hide non-matching offers
        }
    });
});

// Search when the Enter key is pressed
document.getElementById('search-input').addEventListener('keyup', function (event) {
    if (event.key === 'Enter') { // Kontrola, zda byla stisknuta klávesa Enter
        const searchTerm = this.value.toLowerCase();
        const offers = document.querySelectorAll('.grid-item');

        offers.forEach(offer => {
            const offerText = offer.textContent.toLowerCase();
            if (offerText.includes(searchTerm)) {
                offer.style.display = 'grid'; // Restore original display
            } else {
                offer.style.display = 'none'; // Hide non-matching offers
            }
        });
    }
});




let currentOfferId = null;

function openOfferSidebar(offerId) {
    currentOfferId = offerId;
    // Fetch offer details from the backend
    fetch(`../backend/get_offer_details.php?offer_id=${offerId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'error') {
                // Populate the sidebar with offer details
                document.getElementById('offer-category').innerText = data.category_name;
                document.getElementById('offer-type').innerText = data.type;
                document.getElementById('offer-origin').innerText = data.origin;
                document.getElementById('offer-date-of-harvest').innerText = data.date_of_harvest;
                document.getElementById('offer-available-quantity').innerText = data.quantity;
                document.getElementById('offer-price-item').innerText = data.price_item || 'N/A';
                document.getElementById('offer-price-kg').innerText = data.price_kg || 'N/A';

                // Reset quantity input and total price
                const orderQuantityInput = document.getElementById('order-quantity');
                orderQuantityInput.value = 1;
                updateTotalPrice();

                // Show the sidebar
                document.getElementById('offer-detail-sidebar').classList.add('open');
            } else {
                alert('Error fetching offer details.');
            }
        })
        .catch(error => console.error('Error:', error));
}

document.getElementById('close-sidebar').addEventListener('click', function() {
    document.getElementById('offer-detail-sidebar').classList.remove('open');
});

function updateTotalPrice() {
    const quantityInput = document.getElementById('order-quantity');
    const quantity = parseInt(quantityInput.value);

    if (isNaN(quantity) || quantity <= 0) {
        quantityInput.value = 1; // Reset to default valid value
        return;
    }

    const pricePerItem = parseFloat(document.getElementById('offer-price-item').innerText) || 0;
    const pricePerKg = parseFloat(document.getElementById('offer-price-kg').innerText) || 0;
    const offerType = document.getElementById('offer-type').innerText;
    let totalPrice = 0;

    if (offerType === 'sale' && pricePerItem > 0) {
        totalPrice = (quantity * pricePerItem).toFixed(2);
    } else if (offerType === 'selfpick' && pricePerKg > 0) {
        totalPrice = (quantity * pricePerKg).toFixed(2);
    }

    document.getElementById('total-price').innerText = totalPrice;
}


document.getElementById('order-quantity').addEventListener('input', updateTotalPrice);


document.getElementById('place-order-button').addEventListener('click', function() {
    const quantity = parseInt(document.getElementById('order-quantity').value);
    const availableQuantity = parseInt(document.getElementById('offer-available-quantity').innerText);

    if (quantity > availableQuantity) {
        alert('Requested quantity exceeds available quantity.');
        return;
    }

    // Send order details to backend
    fetch('../backend/place_order.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ offer_id: currentOfferId, quantity: quantity })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Order placed successfully!');
                // Update the available quantity
                document.getElementById('offer-available-quantity').innerText = availableQuantity - quantity;
                // Close the sidebar
                document.getElementById('offer-detail-sidebar').classList.remove('open');
                // Optionally, refresh the offers or update the specific offer box
            } else {
                alert('Error placing order: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
});

let isClickInsideSidebar = false; // Indikátor kliknutí uvnitř panelu

// Detekce zahájení kliknutí uvnitř panelu
document.getElementById('offer-detail-sidebar').addEventListener('mousedown', function () {
    isClickInsideSidebar = true;
});

// Detekce ukončení kliknutí
window.addEventListener('mouseup', function (event) {
    const sidebar = document.getElementById('offer-detail-sidebar');
    const marketContainer = document.getElementById('market-container');

    // Pokud kliknete mimo panel a mimo nabídky
    if (!sidebar.contains(event.target) && !marketContainer.contains(event.target)) {
        if (!isClickInsideSidebar) {
            sidebar.classList.remove('open');
        }
    }

    // Reset indikátoru
    isClickInsideSidebar = false;
});


