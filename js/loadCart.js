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

async function updateJsonBooking(passenger_id, booking_object, res_id, jsonURL) {
    const customerData = await fetchData(jsonURL); // Fetch customer data from local JSON
    let booked_length = booking_object.res_id = customerData.passengers["passenger1"].booked.length // Get the length of the booked array to increment the last reservation ID
    booking_object.res_id = customerData.passengers["passenger1"].booked[booked_length-1].res_id+1; // Current reservation ID is last reservation ID plus one
    customerData.passengers["passenger1"].booked.push(booking_object); // Add the new booking
    console.log("CustomerData");
    console.log(customerData);
    await fetch(jsonURL, { // Update the JSON file
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(customerData)
    });
}

function displayCart(cart, flightsXML, ssn, jsonURL) {
    const cartDiv = document.getElementById('cart');
    cartDiv.innerHTML = ''; // Clear previous content
    const bookedDiv = document.getElementById('booked');
    bookedDiv.innerHTML = ''; // Clear previous content
    cart.forEach(flightId => {
        const flight_mode = flightId[0];
        var depart_flight_id = "";
        var return_flight_id = "";
        const orig_flightId= flightId;
        flightId = flightId.substring(1);
        const record = Array.from(flightsXML.querySelectorAll('record')).find(rec => rec.querySelector('flight_id').textContent === flightId);
        if (record) {
            const origin = record.querySelector('origin').textContent;
            const destination = record.querySelector('destination').textContent;
            const departureDate = record.querySelector('departure_date').textContent;
            const departureTime = record.querySelector('departure_time').textContent;
            const arrivalDate = record.querySelector('arrival_date').textContent;
            const arrivalTime = record.querySelector('arrival_time').textContent;
            let numSeats = record.querySelector('num_seats').textContent;
            const price = record.querySelector('price').textContent;
            const price_child = (price * 0.7).toFixed(2);
            const price_infant = (price * 0.1).toFixed(2);
            const flightContainer = document.createElement('div');
            const bookedFlights = document.createElement("div") // TODO: Continue Here
            flightContainer.classList.add('flight-container');
            switch (flight_mode) {
                case "1":
                    flightContainer.innerHTML += (`<h3>One Way</h3>`);
                    depart_flight_id = flightId;
                    break;
                case "2":
                    flightContainer.innerHTML += (`<h3>Round Trip: Departure</h3>`);
                    depart_flight_id = flightId;
                    break;
                case "3":
                    flightContainer.innerHTML += (`<h3>Round Trip: Return</h3>`);
                    return_flight_id = flightId;
            }
            flightContainer.innerHTML +=
                ` <h3>Flight ID: ${flightId}</h3> 
                    <p><strong>Origin:</strong> ${origin}</p> 
                    <p><strong>Destination:</strong> ${destination}</p> 
                    <p><strong>Departure:</strong> ${departureDate} at ${departureTime}</p> 
                    <p><strong>Arrival:</strong> ${arrivalDate} at ${arrivalTime}</p> 
                    <p><strong>Number of Seats:</strong> ${numSeats}</p> 
                    <p><strong>Price:</strong> Adult: $${price} Child: $${price_child} Infant: $${price_infant}</p> 
                    <form id="passenger-form">
                        <div class="passenger-form" id="passenger-1">
                            <h2>Passenger 1</h2>
                            <div class="form-field">
                                <label for="first-name-1">First Name</label>
                                <input type="text" id="first-name-1" name="first-name-1" required>
                            </div>
                            <div class="form-field">
                                <label for="last-name-1">Last Name</label>
                                <input type="text" id="last-name-1" name="last-name-1" required>
                            </div>
                            <div class="form-field">
                                <label for="dob-1">Date of Birth</label>
                                <input type="date" id="dob-1" name="dob-1" required>
                            </div>
                            <div class="form-field">
                                <label for="ssn-1">SSN</label>
                                <input type="text" id="ssn-1" name="ssn-1" required>
                            </div>
                        </div>
                    </form>
                    <button class="add-passenger" onclick="addPassenger()">+ Add Passenger</button><br>
                    <br>
                    <button class="delete-button">Delete</button><br><br>
                    <button id=\"bookButton\" class="book-button">Book</button> `;
            flightContainer.querySelector('.delete-button').addEventListener('click', async () => { // Remove flight from cart
                const updatedCart = cart.filter(id => id !== orig_flightId);
                await updateJsonData(ssn, updatedCart, jsonURL); // Reload cart
                displayCart(updatedCart, flightsXML, ssn, jsonURL);
            });
            cartDiv.appendChild(flightContainer);
            document.getElementById("bookButton").addEventListener('click', async () => { // Remove flight from cart
                var newBooking =         {
                    "res_id": "",
                    "departure": depart_flight_id,
                    "return": return_flight_id,
                    "passengers": []
                }

                var passengers = [];
                for (let i = 1; i <= passengerCount; i++) {
                    passengers.push( {
                        "fname": document.getElementById(`first-name-${i}`).value,
                        "lname": document.getElementById(`last-name-${i}`).value,
                        "dob": document.getElementById(`dob-${i}`).value,
                        "ssn": document.getElementById(`ssn-${i}`).value
                    });
                    --numSeats;
                    record.querySelector('num_seats').textContent = numSeats; // update num seats in the XML file
                }
                newBooking.passengers=passengers;
                console.log(passengers);
                await updateJsonBooking("passenger1", newBooking, 1, jsonURL); // Reload cart
                const updatedCart = cart.filter(id => id !== orig_flightId);
                displayCart(updatedCart, flightsXML, ssn, jsonURL);
            });
        }
    });
}

let passengerCount = 1;

function addPassenger() {
    passengerCount++;
    const form = document.getElementById('passenger-form');
    const newPassengerDiv = document.createElement('div');
    newPassengerDiv.className = 'passenger-form';
    newPassengerDiv.id = 'passenger-' + passengerCount;

    newPassengerDiv.innerHTML = `
                <h2>Passenger ${passengerCount}</h2>
                <div class="form-field">
                    <label for="first-name-${passengerCount}">First Name</label>
                    <input type="text" id="first-name-${passengerCount}" name="first-name-${passengerCount}" required>
                </div>
                <div class="form-field">
                    <label for="last-name-${passengerCount}">Last Name</label>
                    <input type="text" id="last-name-${passengerCount}" name="last-name-${passengerCount}" required>
                </div>
                <div class="form-field">
                    <label for="dob-${passengerCount}">Date of Birth</label>
                    <input type="date" id="dob-${passengerCount}" name="dob-${passengerCount}" required>
                </div>
                <div class="form-field">
                    <label for="ssn-${passengerCount}">SSN</label>
                    <input type="text" id="ssn-${passengerCount}" name="ssn-${passengerCount}" required>
                </div>
            `;

    form.appendChild(newPassengerDiv);
}

async function loadCart() {
    const jsonURL = '../json/data.json';
    const xmlURL = '../xml/data.xml';
    const customerData = await fetchData(jsonURL);
    const currentCustomer = "" // TODO: Needs to be updated
    console.log(customerData.passengers);
    const flightsXML = await fetchXML(xmlURL);
    console.log(flightsXML);
    console.log(flightsXML.querySelector("[*|flight_id='9954454208']"));
    const cart_oneway = customerData.passengers["passenger1"].cart.oway;
    cart_oneway.forEach(((cart, index) => {
        cart_oneway[index] = "1" + cart;
    }));
    const cart_rtrip_d = customerData.passengers["passenger1"].cart.rtrip.departures;
    cart_rtrip_d.forEach(((cart, index) => {
        cart_rtrip_d[index] = "2" + cart;
    }));
    const cart_rtrip_r = customerData.passengers["passenger1"].cart.rtrip.returns;
    cart_rtrip_r.forEach(((cart, index) => {
        cart_rtrip_r[index] = "3" + cart;
    }));
    const concat_cart = [...cart_oneway, ...cart_rtrip_d, ...cart_rtrip_r];
    console.log(concat_cart);
    const customerssn = customerData.passengers["passenger1"].ssn;
    displayCart(concat_cart, flightsXML, customerssn, jsonURL);
}

loadCart();