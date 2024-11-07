async function fetchData(url) {
    const response = await fetch(url);
    return response.json();
}

async function fetchXML(url) {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    return parser.parseFromString(text, "application/xml");
}

async function updateJsonData(ssn, updatedCart, jsonURL) {
    const customerData = await fetchData(jsonURL);
    console.log("Helo");
    console.log(customerData);
    customerData.passengers["passenger1"].cart = updatedCart;
    await fetch(jsonURL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(customerData)
    });
}

function displayCart(cart, flightsXML, ssn, jsonURL) {
    const cartDiv = document.getElementById('cart');
    cartDiv.innerHTML = ''; // Clear previous content
    cart.forEach(flightId => {
        const record = Array.from(flightsXML.querySelectorAll('record')).find(rec => rec.querySelector('flight_id').textContent === flightId);
        if (record) {
            const origin = record.querySelector('origin').textContent;
            const destination = record.querySelector('destination').textContent;
            const departureDate = record.querySelector('departure_date').textContent;
            const departureTime = record.querySelector('departure_time').textContent;
            const arrivalDate = record.querySelector('arrival_date').textContent;
            const arrivalTime = record.querySelector('arrival_time').textContent;
            const numSeats = record.querySelector('num_seats').textContent;
            const price = record.querySelector('price').textContent;
            const flightContainer = document.createElement('div');
            flightContainer.classList.add('flight-container');
            flightContainer.innerHTML =
                ` <h3>Flight ID: ${flightId}</h3> 
                    <p><strong>Origin:</strong> ${origin}</p> 
                    <p><strong>Destination:</strong> ${destination}</p> 
                    <p><strong>Departure:</strong> ${departureDate} at ${departureTime}</p> 
                    <p><strong>Arrival:</strong> ${arrivalDate} at ${arrivalTime}</p> 
                    <p><strong>Number of Seats:</strong> ${numSeats}</p> 
                    <p><strong>Price:</strong> $${price}</p> 
                    <button class="delete-button">Delete</button> `;
            flightContainer.querySelector('.delete-button').addEventListener('click', async () => { // Remove flight from cart
                const updatedCart = cart.filter(id => id !== flightId);
                await updateJsonData(ssn, updatedCart, jsonURL); // Reload cart
                displayCart(updatedCart, flightsXML, ssn, jsonURL);
            });
            cartDiv.appendChild(flightContainer);
        }
    });
}

async function loadCart() {
    const ssn = "###-##-####"; // Replace with actual SSN
    const jsonURL = '../json/data.json';
    const xmlURL = '../xml/data.xml';
    const customerData = await fetchData(jsonURL);
    console.log(customerData.passengers);
    const flightsXML = await fetchXML(xmlURL);
    console.log(flightsXML);
    console.log(flightsXML.querySelector("[*|flight_id='9954454208']"));
    const cart = customerData.passengers["passenger1"].cart;
    const customerssn = customerData.passengers["passenger1"].ssn;
    displayCart(cart, flightsXML, customerssn, jsonURL);
}

loadCart();