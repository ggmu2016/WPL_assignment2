const port = 4000;

function findFlights(org, dst, depDate, seats) {
    const apiBaseURL = `http://localhost:${port}`;
    return fetch(
        `${apiBaseURL}/search-flights?origin=${org}&destination=${dst}&departureDate=${depDate.toISOString()}&seats=${seats}`
    )
        .then(res => res.json())
        .then(flights => {
            console.log("Found Flights:", flights);
            return flights;
        })
        .catch(err => console.error(err));
}

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

async function addFlightNumToJSON(oneWayID, returnID) {
    const apiBaseURL = `http://localhost:${port}`;
    let response = await fetch(
        `${apiBaseURL}/passenger-info`
    )
    let customerData = await response.json();
    console.log(customerData);
    if (returnID){
        customerData.passengers["passenger1"].cart.rtrip.departures.push(oneWayID);
        customerData.passengers["passenger1"].cart.rtrip.returns.push(returnID);
    }
    else{
        customerData.passengers["passenger1"].cart.oway.push(oneWayID);
    }
    // Send updated JSON back to the server
    const updateResponse = await fetch(`${apiBaseURL}/update-json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
    });
    console.log("Passenger info updated successfully");
}


