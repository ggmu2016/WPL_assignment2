const jsonFetchURL = "../json/data.json";
const port = 4000;

async function bookFlight(flightId, seatsToBook) {
    try{
        const response = await fetch(`http://localhost:${port}/book-flight`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({flightId, seatsToBook}),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error booking flight:", errorData);
            alert(`Error: ${errorData.error}`);
            return;
        }
        const data = await response.json();
        console.log("Booking successful:", data);
        alert("Booking successful");
    } catch (err){
        console.log(err)
    }
}

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

async function updateJsonData(updatedData) {
    await fetch(`http://localhost:${port}/update-json`, { // Update the JSON file
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updatedData)
    });
}

async function deleteFromCart(customerData, booking_object) {
    if (!booking_object.return_f) {
        let oneways = customerData.passengers["passenger1"].cart.oway;
        let index = oneways.findIndex(item => item.valueOf() === booking_object.departure.valueOf());

        // Check if the element was found
        if (index !== -1) { // Remove the element using splice
            oneways.splice(index, 1);
        }
    } else {
        let rtrips_d = customerData.passengers["passenger1"].cart.rtrip.departures;
        let rtrips_r = customerData.passengers["passenger1"].cart.rtrip.returns;

        let index = rtrips_d.findIndex(item => item.valueOf() === booking_object.departure.valueOf());
        // Check if the element was found
        if (index !== -1) { // Remove the element using splice
            rtrips_d.splice(index, 1);
        }

        index = rtrips_r.findIndex(item => item.valueOf() === booking_object.return_f.valueOf());
        // Check if the element was found
        if (index !== -1) { // Remove the element using splice
            rtrips_r.splice(index, 1);
        }
    }
}

async function updateJsonBooking(passenger_id, booking_object, res_id, flightsXML) {
    var customerdata = await fetchData(jsonFetchURL); // Fetch customer data from local JSON
    let booked_length = booking_object.res_id = customerdata.passengers["passenger1"].booked.length // Get the length of the booked array to increment the last reservation ID
    booking_object.res_id = customerdata.passengers["passenger1"].booked[booked_length - 1].res_id + 1; // Current reservation ID is last reservation ID plus one
    deleteFromCart(customerdata, booking_object);
    customerdata.passengers["passenger1"].booked.push(booking_object); // Add the new booking
    updateJsonData(customerdata);
    displayCart(getCart(customerdata), flightsXML);
    displayBooked(customerdata.passengers["passenger1"].booked, flightsXML);
}

function displayCart(cart, flightsXML) {
    const cartDiv = document.getElementById('cart');
    cartDiv.innerHTML = ''; // Clear previous content
    var i = 0;

    cart.forEach(flightId => {
        const flight_mode = flightId[0];
        var depart_flight_id = "";
        var return_flight_id = "";
        const orig_flightId = flightId;
        flightId = flightId.substring(1);
        var record = Array.from(flightsXML.querySelectorAll('record')).find(rec => rec.querySelector('flight_id').textContent === flightId);
        const flightContainer = document.createElement('div');
        switch (flight_mode) {
            case "1":
                flightContainer.innerHTML += (`<h3>One Way</h3>`);
                depart_flight_id = flightId;
                break;
            case "2":
                flightContainer.innerHTML += (`<h3>Round Trip</h3>`);
                depart_flight_id = flightId;
                return_flight_id = cart[i+1].substring(1);
                break;
            case "3":
                record = false;
                break;
        }
        if (record) {
            let origin = record.querySelector('origin').textContent;
            let destination = record.querySelector('destination').textContent;
            let departureDate = record.querySelector('departure_date').textContent;
            let departureTime = record.querySelector('departure_time').textContent;
            let arrivalDate = record.querySelector('arrival_date').textContent;
            let arrivalTime = record.querySelector('arrival_time').textContent;
            let numSeats = record.querySelector('num_seats').textContent;
            let price = record.querySelector('price').textContent;
            let price_child = (price * 0.7).toFixed(2);
            let price_infant = (price * 0.1).toFixed(2);
            flightContainer.classList.add('flight-container');
            flightContainer.innerHTML +=
                ` <h3>Departure Flight ID: ${flightId}</h3> 
                    <p hidden="true" id="passCount-${flightId}">1</p>
                    <p><strong>Origin:</strong> ${origin}</p> 
                    <p><strong>Destination:</strong> ${destination}</p> 
                    <p><strong>Departure:</strong> ${departureDate} at ${departureTime}</p> 
                    <p><strong>Arrival:</strong> ${arrivalDate} at ${arrivalTime}</p> 
                    <p><strong>Number of Seats:</strong> ${numSeats}</p> 
                    <p><strong>Price:</strong> Adult: $${price} Child: $${price_child} Infant: $${price_infant}</p>
                    <br>
                `

            if(flight_mode === "2"){
                record = Array.from(flightsXML.querySelectorAll('record')).find(rec => rec.querySelector('flight_id').textContent === return_flight_id);
                let origin = record.querySelector('origin').textContent;
                let destination = record.querySelector('destination').textContent;
                let departureDate = record.querySelector('departure_date').textContent;
                let departureTime = record.querySelector('departure_time').textContent;
                let arrivalDate = record.querySelector('arrival_date').textContent;
                let arrivalTime = record.querySelector('arrival_time').textContent;
                let numSeats = record.querySelector('num_seats').textContent;
                let price = record.querySelector('price').textContent;
                let price_child = (price * 0.7).toFixed(2);
                let price_infant = (price * 0.1).toFixed(2);
                flightContainer.innerHTML +=
                    ` <h3>Return Flight ID: ${return_flight_id}</h3> 
                    <p hidden="true" id="passCount-${flightId}">1</p>
                    <p><strong>Origin:</strong> ${origin}</p> 
                    <p><strong>Destination:</strong> ${destination}</p> 
                    <p><strong>Departure:</strong> ${departureDate} at ${departureTime}</p> 
                    <p><strong>Arrival:</strong> ${arrivalDate} at ${arrivalTime}</p> 
                    <p><strong>Number of Seats:</strong> ${numSeats}</p> 
                    <p><strong>Price:</strong> Adult: $${price} Child: $${price_child} Infant: $${price_infant}</p>
                    <br>
                `
            }

            flightContainer.innerHTML += `
                    <form id="passenger-form-${flightId}">
                        <div class="passenger-form" id="passenger-1">
                            <h2>Passenger 1</h2>
                            <div class="form-field">
                                <label for="first-name-${flightId}-1">First Name</label>
                                <input type="text" id="first-name-${flightId}-1" name="first-name-1" pattern="[a-zA-Z\s]+" required 
                           title="First name must contain only letters.">
                            </div>
                            <div class="form-field">
                                <label for="last-name-${flightId}-1">Last Name</label>
                                <input type="text" id="last-name-${flightId}-1" name="last-name-1" pattern="[a-zA-Z\s]+" required 
                           title="Last name must contain only letters.">
                            </div>
                            <div class="form-field">
                                <label for="dob-${flightId}-1">Date of Birth</label>
                                <input type="date" id="dob-${flightId}-1" name="dob-1" required title="Date of Birth is Required. ">
                            </div>
                            <div class="form-field">
                                <label for="ssn-${flightId}-1">SSN</label>
                                <input type="text" id="ssn-${flightId}-1" name="ssn-1" pattern="\d{9}" required 
                           title="Enter a 9-digit SSN.">
                            </div>
                            <div class="form-field">
                                <label for="category-${flightId}-1">Category</label>
                                <select id="category-${flightId}-1" name="category-1" required>
                                    <option value="adults">Adults</option>
                                    <option value="children">Children</option>
                                    <option value="infants">Infants</option>
                                </select>
                            </div>
                        </div>
                    </form>
                    <button class="add-passenger" onclick="addPassenger(${flightId})">+ Add Passenger</button><br>
                    <br>
                    <button class="delete-button">Delete</button><br><br>
                    <button class="book-button">Book</button> `;
            flightContainer.querySelector('.delete-button').addEventListener('click', async () => { // Remove flight from cart
                var newBooking = {
                    "res_id": "",
                    "departure": depart_flight_id,
                    "return_f": return_flight_id,
                    "passengers": []
                }
                let customerdata = await fetchData(jsonFetchURL);
                deleteFromCart(customerdata, newBooking);
                updateJsonData(customerdata); // Reload cart
                displayCart(getCart(customerdata), flightsXML);
            });
            flightContainer.querySelector('.book-button').addEventListener('click', async () => {
                var newBooking = {
                    "res_id": "",
                    "departure": depart_flight_id,
                    "return_f": return_flight_id,
                    "passengers": []
                }
                let passengerCount = document.getElementById("passCount-" + flightId).textContent.valueOf();
                let passengers = [];
                const passengers2 = [];
                let totalPrice = 0;
                for (let j = 1; j <= passengerCount; j++) {
                    const fname = document.getElementById(`first-name-${flightId}-${j}`).value;
                    const lname = document.getElementById(`last-name-${flightId}-${j}`).value;
                    const dob = document.getElementById(`dob-${flightId}-${j}`).value;
                    const ssn = document.getElementById(`ssn-${flightId}-${j}`).value;
                    const category = document.getElementById(`category-${flightId}-${i}`).value;

                    if (!fname || !lname || !dob || !ssn || !category) {
                        alert(`Please fill all fields for Passenger ${i}`);
                        return;
                    }
                    --numSeats;
                    passengers.push({fname,lname,dob,ssn,category});

                    // Calculate total price (with discounts for children and infants)
                    const flightRecord = Array.from(flightsXML.querySelectorAll('record')).find(rec => rec.querySelector('flight_id').textContent === flightId);
                    let passengerPrice = parseFloat(flightRecord.querySelector('price').textContent);
                    if (category === 'children') passengerPrice *= 0.7; // 30% discount
                    if (category === 'infants') passengerPrice *= 0.1;// 90% discount

                    passengers2.push({ssn:ssn, price:passengerPrice});
                    totalPrice += passengerPrice;
                    record.querySelector('num_seats').textContent = numSeats; // update num seats in the XML file

                }

                // Insert passengers into the database
                for (const passenger of passengers) {
                    await fetch(`http://localhost:${port}/add-passenger`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(passenger),
                    });
                }

                // Insert flight booking into the database
                const bookingData = {
                    flight_id: flightId,
                    total_price: totalPrice.toFixed(2),
                };

                const flightBookingResponse = await fetch(`http://localhost:${port}/add-flight-booking`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingData),
                });
                const {flight_booking_id} = await flightBookingResponse.json();

                //insert tix for each passenger
                for (const passenger of passengers2){
                    await fetch(`http://localhost:${port}/add-ticket`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({flight_booking_id,ssn:passenger.ssn,price:passenger.price}),
                    });
                }
                alert('Booking successful!');

                newBooking.passengers = passengers;

                await updateJsonBooking("passenger1", newBooking, 1, flightsXML); // Reload cart
                if (depart_flight_id){await bookFlight(depart_flight_id,passengerCount)}
                if (return_flight_id){await bookFlight(return_flight_id,passengerCount)}

            });
            cartDiv.appendChild(flightContainer);
            i+=1;
        }
    });
}

function displayBooked(bookedFlights, flightsXML) {
    const bookedDiv = document.getElementById('booked');
    bookedDiv.innerHTML = ''; // Clear previous content
    bookedFlights.forEach(flight => {
        var depart_flight_id = flight.departure;
        var return_flight_id = flight.return_f;
        let dep_record = "";
        let ret_record = "";
        let record = "";

        if (depart_flight_id) {
            dep_record = Array.from(flightsXML.querySelectorAll('record')).find(rec => rec.querySelector('flight_id').textContent === depart_flight_id);
        }
        if (return_flight_id) {
            ret_record = Array.from(flightsXML.querySelectorAll('record')).find(rec => rec.querySelector('flight_id').textContent === return_flight_id);
        }

        for (let i = 0; i < 2; i++) {
            if (i === 0) {
                record = dep_record;
            }
            if (i === 1) {
                record = ret_record;
            }

            if (record) {
                const origin = record.querySelector('origin').textContent;
                const destination = record.querySelector('destination').textContent;
                const departureDate = record.querySelector('departure_date').textContent;
                const departureTime = record.querySelector('departure_time').textContent;
                const arrivalDate = record.querySelector('arrival_date').textContent;
                const arrivalTime = record.querySelector('arrival_time').textContent;
                const flightContainer = document.createElement('div');
                flightContainer.classList.add('flight-container');
                if (i === 0) {
                    flightContainer.innerHTML += ` <h3>Flight ID: ${depart_flight_id}</h3> `
                }
                if (i === 1) {
                    flightContainer.innerHTML += ` <h3>Flight ID: ${return_flight_id}</h3> `
                }
                flightContainer.innerHTML +=
                    `<p><strong>Origin:</strong> ${origin}</p> 
                    <p><strong>Destination:</strong> ${destination}</p> 
                    <p><strong>Departure:</strong> ${departureDate} at ${departureTime}</p> 
                    <p><strong>Arrival:</strong> ${arrivalDate} at ${arrivalTime}</p> 
                    <br>
                    <h3><strong>Passengers</strong></h3>
                    `;
                flight.passengers.forEach(passenger => {
                    flightContainer.innerHTML +=
                        "</p><strong>Name</strong>: " + passenger.fname + " " + passenger.lname + " <strong>DoB: </strong>" + passenger.dob + " <strong>SSN: </strong>" + passenger.ssn + "</p>";
                });
                bookedDiv.appendChild(flightContainer);
            }
        }
    });
}

function addPassenger(flightId) {
    let passengerCount = document.getElementById("passCount-" + flightId).textContent.valueOf();
    passengerCount++;
    document.getElementById("passCount-" + flightId).textContent = passengerCount;
    const form = document.getElementById(`passenger-form-${flightId}`);
    const newPassengerDiv = document.createElement('div');
    newPassengerDiv.className = 'passenger-form';
    newPassengerDiv.id = 'passenger-' + passengerCount;
    newPassengerDiv.innerHTML = `
                <h2>Passenger ${passengerCount}</h2>
                <div class="form-field">
                    <label for="first-name-${flightId}-${passengerCount}">First Name</label>
                    <input type="text" id="first-name-${flightId}-${passengerCount}" name="first-name-${passengerCount}" pattern="[a-zA-Z\s]+" required 
                           title="First name must contain only letters.">
                </div>
                <div class="form-field">
                    <label for="last-name-${flightId}-${passengerCount}">Last Name</label>
                    <input type="text" id="last-name-${flightId}-${passengerCount}" name="last-name-${passengerCount}" pattern="[a-zA-Z\s]+" required 
                           title="Last name must contain only letters.">
                </div>
                <div class="form-field">
                    <label for="dob-${flightId}-${passengerCount}">Date of Birth</label>
                    <input type="date" id="dob-${flightId}-${passengerCount}" name="dob-${passengerCount}" required title="Date of birth is required.">
                </div>
                <div class="form-field">
                    <label for="ssn-${flightId}-${passengerCount}">SSN</label>
                    <input type="text" id="ssn-${flightId}-${passengerCount}" name="ssn-${passengerCount}" pattern="\d{9}" required 
                           title="Enter a 9-digit SSN.">
                </div>
                <div class="form-field">
                    <label for="category-${flightId}-${passengerCount}">Category</label>
                    <select id="category-${flightId}-${passengerCount}" name="category-${passengerCount}" required>
                        <option value="adults">Adults</option>
                        <option value="children">Children</option>
                        <option value="infants">Infants</option>
                    </select>
                </div>
            `;

    form.appendChild(newPassengerDiv);
}

function getCart(customerData) {
    var concat_cart = [];
    const cart_oneway = customerData.passengers["passenger1"].cart.oway;
    try {
        cart_oneway.forEach(((cart, index) => {
            cart_oneway[index] = "1" + cart;
        }));
        concat_cart = concat_cart.concat(cart_oneway);
    } catch (error) {
    }

    try {
        const cart_rtrip_d = customerData.passengers["passenger1"].cart.rtrip.departures;
        cart_rtrip_d.forEach(((cart, index) => {
            cart_rtrip_d[index] = "2" + cart;
        }));
        concat_cart = concat_cart.concat(cart_rtrip_d);
    } catch (error) {
    }

    try {
        const cart_rtrip_r = customerData.passengers["passenger1"].cart.rtrip.returns;
        cart_rtrip_r.forEach(((cart, index) => {
            cart_rtrip_r[index] = "3" + cart;
        }));
        concat_cart = concat_cart.concat(cart_rtrip_r);
    } catch (error) {
    }

    return concat_cart;
}

async function loadCart() {
    const customerData = await fetchData(jsonFetchURL);
    const flightsXML = await fetchXML("../xml/data.xml");

    var concat_cart = getCart(customerData);
    if (concat_cart.length != 0) {
        displayCart(concat_cart, flightsXML);
    }

    let customer_booked = customerData.passengers["passenger1"].booked;
    if (customer_booked.length != 0) {
        displayBooked(customer_booked, flightsXML);
    }
}

loadCart();