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
                marketContainer.appendChild(offerBox);
            });
        })
        .catch(error => console.error('Error:', error));
});




