const port = 4000;
document.getElementById("user-form1").addEventListener("submit", loadQuery1);
document.getElementById("user-form2").addEventListener("submit", loadQuery2);
document.getElementById("user-form3").addEventListener("submit", loadQuery3);


// all flight and hotel data
async function loadQuery1(event){
    event.preventDefault();
    const flightbookingID = document.getElementById("flight-id1").value;
    const hotelbookingID = document.getElementById("hotel-id1").value;
    const tbody = document.querySelector("#booking-info-tbl tbody");
    console.log('hotelbookingid', hotelbookingID);

    const response = await fetch(`http://localhost:${port}/booking-info/${flightbookingID}/${hotelbookingID}`, {})
    const jsonData = await response.json();
    let flights = null;
    if (jsonData.flights) {
        flights = jsonData.flights;
        tbody.innerHTML = "";
        flights.forEach(flight => {
            const row = document.createElement("tr");
            Object.values(flight).forEach(element => {
                const cell = document.createElement("td");
                cell.textContent = element;
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        });

        document.querySelector("#booking-info-tbl").style = "display:table";
    }
}

// passenger info query
async function loadQuery2(event){
    event.preventDefault();
    const flightbookingID = document.getElementById("flight-id2").value;
    if (!flightbookingID){
        alert("Please enter valid flight id");
    }
    else {
        const tbody = document.querySelector("#passenger-info-tbl tbody");

        const response = await fetch(`http://localhost:${port}/passenger-info/${flightbookingID}`, {})
        const passengers = await response.json();

        tbody.innerHTML = "";
        passengers.forEach(passenger => {
            const row = document.createElement("tr");
            Object.values(passenger).forEach(element => {
                const cell = document.createElement("td");
                cell.textContent = element;
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        });

        document.querySelector("#passenger-info-tbl").style = "display:table";
    }
}

async function loadQuery3(event){
    event.preventDefault();
    const passenger_ssn = document.getElementById("ssn").value.trim();
    const tbody = document.querySelector("#booked-flight-tbl tbody");

    const response = await fetch(`http://localhost:${port}/booking-info/${passenger_ssn}`, {})
    const passengers = await response.json();
    console.log("passengers", passengers);

    tbody.innerHTML="";
    passengers.forEach(passenger => {
        const row = document.createElement("tr");
        Object.values(passenger).forEach(element => {
            const cell = document.createElement("td");
            cell.textContent = element;
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });

    document.querySelector("#booked-flight-tbl").style = "display:table";
}



async function fetchFlightData(event){
    try {
        const response = await fetch(`http://localhost:${port}/insert-flights`, {
            method: 'POST',
        });
        if (response.ok) {
            const result = await response.json();
            alert(`Successfully added!`)
        } else {
            const err = await response.json();
            alert("Error, could not add data!");
        }
    }catch (err){
        console.error("Request failed: ", err);
    }
}