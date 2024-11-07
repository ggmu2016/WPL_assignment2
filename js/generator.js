const citiesTexas = ["Austin", "Dallas", "Houston", "San Antonio", "Fort Worth"];
const citiesCalifornia = ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose"];
const minDate = new Date('2024-09-01');
const maxDate = new Date('2024-12-01');
const numberOfRecords = 100;

function getRandomDate(start, end) {
    let date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date;
}

function getRandomCity(stateCities) {
    return stateCities[Math.floor(Math.random() * stateCities.length)];
}

function getUniqueFlightId(existingIds) {
    let flightId;
    do {
        flightId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    } while (existingIds.has(flightId));
    existingIds.add(flightId);
    return flightId;
}

function getRandomTime() {
    let hours = Math.floor(Math.random() * 16) + 6; // 6 AM to 10 PM
    let minutes = Math.floor(Math.random() * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function getArrivalDateTime(departureDate, departureTime) {
    let travelTimeHours = Math.floor(Math.random() * 10) + 1; // Random travel time between 1 to 10 hours
    let [hours, minutes] = departureTime.split(':').map(Number);
    let arrivalDate = new Date(departureDate);
    arrivalDate.setHours(hours + travelTimeHours, minutes);
    let arrivalTime = `${arrivalDate.getHours().toString().padStart(2, '0')}:${arrivalDate.getMinutes().toString().padStart(2, '0')}`;
    return {arrivalDate, arrivalTime};
}

function getRandomPrice() {
    return (Math.random() * 400 + 100).toFixed(2); // Random price between 100 and 500
}

function getRandomSeats() {
    return Math.floor(Math.random() * 81) + 20; // Random number between 20 and 100
}

let records = new Set();
let flightIds = new Set();
while (records.size < numberOfRecords) {
    let origin, destination;

    // Randomly decide if the origin will be from Texas or California
    if (Math.random() < 0.5) {
        origin = getRandomCity(citiesTexas);
        destination = getRandomCity(citiesCalifornia);
    } else {
        origin = getRandomCity(citiesCalifornia);
        destination = getRandomCity(citiesTexas);
    }

    let departureDate = getRandomDate(minDate, maxDate);
    let departureTime = getRandomTime();
    let {arrivalDate, arrivalTime} = getArrivalDateTime(departureDate, departureTime);
    let price = getRandomPrice();
    let flightId = getUniqueFlightId(flightIds);
    let numSeats = getRandomSeats(); // Get a random number of seats between 20 and 100
    let record = {
        flight_id: flightId,
        origin: origin,
        destination: destination,
        departure_date: departureDate,
        departure_time: departureTime,
        arrival_date: arrivalDate,
        arrival_time: arrivalTime,
        num_seats: numSeats,
        price: price
    };

    let recordStr = JSON.stringify(record);
    if (!records.has(recordStr)) {
        records.add(recordStr);
    }
}

let sortedRecords = Array.from(records).map(record => {
    let obj = JSON.parse(record);
    obj.departure_date = new Date(obj.departure_date); // Ensure date is a Date object
    obj.arrival_date = new Date(obj.arrival_date); // Ensure date is a Date object
    return obj;
}).sort((a, b) => a.departure_date - b.departure_date);

let xmlRecords = '';
sortedRecords.forEach(record => {
    let departureDate = `${record.departure_date.getMonth() + 1}/${record.departure_date.getDate()}/${record.departure_date.getFullYear()}`;
    let arrivalDate = `${record.arrival_date.getMonth() + 1}/${record.arrival_date.getDate()}/${record.arrival_date.getFullYear()}`;
    xmlRecords += `
    <record>
        <flight_id>${record.flight_id}</flight_id>
        <origin>${record.origin}</origin>
        <destination>${record.destination}</destination>
        <departure_date>${departureDate}</departure_date>
        <departure_time>${record.departure_time}</departure_time>
        <arrival_date>${arrivalDate}</arrival_date>
        <arrival_time>${record.arrival_time}</arrival_time>
        <num_seats>${record.num_seats}</num_seats>
        <price>${record.price}</price>
    </record>`;
});

console.log(xmlRecords);
