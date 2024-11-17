
function findFlights(org, dst, depDate, seats) {
    const apiBaseURL = "http://localhost:4000";
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
        const apiBaseURL = "http://localhost:4000";
        const response = await fetch('book-flight',{
            method: "POST",
            headers: {
                contentType: "application/json",
            },
            body: JSON.stringify({flightId, seatsToBook}),
        })
        const data = await response.json();
        if (data.error){
            console.log(data.error);
        } else{
            console.log("Booking successful: ", data);
            alert('Booking successful');
            return data.updatedFlight;
        }
    } catch (err){
        console.log(err)
    }
}





//                 return allFlights;
//             } else {
//                 console.log("Sorry. No flights found.")
//             }
//         })
//
// }