
function findFlights(org, dst, depDate, seats) {
    const apiBaseURL = "http://localhost:3000";
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