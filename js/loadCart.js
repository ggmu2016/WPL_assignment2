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
    customerData.passengers["passenger1"].cart = updatedCart;
    await fetch(jsonURL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(customerData)
    });
}

async function updateJsonBooking(fname, lname, dob, ssn, reservation, jsonURL) {
    const customerData = await fetchData(jsonURL);
    customerData.passengers["passenger1"].booked = reservation;
    await fetch(jsonURL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(customerData)
    });
}

function displayCart(cart, flightsXML, ssn, jsonURL) {
    const cartDiv = document.getElementById('cart');
    const bookDiv = document.getElementById('book');
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
                    <form>
                        <text>First Name: </text><input type="text" id="fname_form"><br>
                        <text>Last Name: </text><input type="text" id="lname_form"><br>
                        <text>Date of Birth: </text><input type="text" id="dob_form"><br>
                        <text>SSN: </text><input type="SSN" id="ssn_form">
                    </form>
                    <br>
                    <button class="delete-button">Delete</button><br><br>
                    <button id=\"bookButton\" class="book-button">Book</button> `;
            flightContainer.querySelector('.delete-button').addEventListener('click', async () => { // Remove flight from cart
                const updatedCart = cart.filter(id => id !== flightId);
                await updateJsonData(ssn, updatedCart, jsonURL); // Reload cart
                displayCart(updatedCart, flightsXML, ssn, jsonURL);
            });
            cartDiv.appendChild(flightContainer);
            bookDiv.innerHTML = "";
            document.getElementById("bookButton").addEventListener('click', async () => { // Remove flight from cart
                const fname = document.getElementById("fname_form").textContent;
                const lname = document.getElementById("lname_form").textContent;
                const dob = document.getElementById("dob_form").textContent;
                const ssn = document.getElementById("ssn_form").textContent;
                var obj = {name: fname, lname: lname, dob: dob, ssn: ssn};

                await updateJsonBooking(fname, lname, dob, ssn, 1, jsonURL); // Reload cart
                displayCart(updatedCart, flightsXML, ssn, jsonURL);
            });
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