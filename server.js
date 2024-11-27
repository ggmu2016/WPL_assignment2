const express = require("express");
const fs = require("fs").promises;
const app = express();
const port = 3000;
// parse XML
const xml2js = require("xml2js")

const cors = require("cors")
const {Client} = require("pg");

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());

const xmlFilePath = "xml/data.xml";
const jsonFilePath = "json/data.json";


// set up connection with database (postgres)
const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    password: "admin",
    host: "localhost",
    port: 5432,
    database: "wpl_db"
});


// function to read and parse XML
async function readXMLFile() {
    const data = await fs.readFile(xmlFilePath);
    return xml2js.parseStringPromise(data);
}

// write updated XML back to file
async function writeXMLFile(data) {
    return new Promise((resolve, reject) => {
        const builder = new xml2js.Builder();
        const xml = builder.buildObject(data);
        fs.writeFile(xmlFilePath, xml, (err) => {
            if (err) {
                reject(err)
            }
            resolve();
        });
    });
}

// function to read and parse JSON
async function readJSONFile() {
    const data = await fs.readFile(jsonFilePath);
    return JSON.parse(data);
}

// write updated JSON back to file
async function writeJSONFile(data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(jsonFilePath, data, (err) => {
            if (err) {
                reject(err)
            }
            resolve();
        });
    });
}


// API route to get JSON file
app.get("/passenger-info", async (req, res) => {
    const jsonData = await readJSONFile();
    res.json(jsonData);
})


// API route to search for flights
app.get("/search-flights", async (req, res) => {
    try {
        const {origin, destination, departureDate, seats} = req.query;
        const xmlData = await readXMLFile();

        // extract flight records
        const flights = xmlData.dataset.record;

        // filter xml flights based on query
        const filteredFlights = flights.filter(flight => {
            const originFlight = flight.origin[0].toLowerCase();
            const destinationFlight = flight.destination[0].toLowerCase();
            const depDate = new Date(flight.departure_date[0]);
            const numSeats = parseInt(flight.num_seats[0]);

            // input departure date bounds
            const userDepDate = new Date(departureDate);
            const lowerBound = new Date(userDepDate);
            lowerBound.setDate(userDepDate.getDate() - 3);
            const upperBound = new Date(userDepDate);
            upperBound.setDate(userDepDate.getDate() + 3);

            return (
                originFlight === origin.toLowerCase() &&
                destinationFlight === destination.toLowerCase() &&
                numSeats >= parseInt(seats) &&
                depDate >= lowerBound &&
                depDate <= upperBound
            );
        });
        res.json(filteredFlights);

    } catch (error) {
        console.log(error);
    }
})


// update seats (book flight)
app.post("/book-flight", async (req, res) => {
    try {
        const {flightId, seatsToBook} = req.body;
        if (!flightId || seatsToBook === undefined) {
            return res.status(400).send({error: "Invalid request body"});
        }
        const xmlData = await readXMLFile();

        //find flight by id
        const records = Array.from(xmlData.dataset.record);
        const flight = records.find(f => f.flight_id[0] === flightId);

        if (!flight) {
            return res.status(400).send("No flight found.");
        }
        const availableSeats = parseInt(flight.num_seats[0]);
        if (availableSeats < parseInt(seatsToBook)) {
            return res.status(400).send("Not enough seats found.");
        }

        //updating number of available seats
        flight.num_seats[0] = (availableSeats - seatsToBook).toString();

        await writeXMLFile(xmlData);
        res.json({message: "Seats updated successfully.", updatedFlight: flight});

    } catch (err) {
        console.log(err);
    }
});

app.post("/update-json", async (req, res) => {
    try {
        const customer_data = req.body;

        await writeJSONFile(JSON.stringify(customer_data, null, 2));
    } catch (err) {
        console.log(err);
    }
});


//The user should be able to retrieve all the information about
// booked flights and booked hotels using hotel-booking id and Flight-booking-id
app.get("booking-info/:id1/:id2", async (req, res) => {
    try {
        const {id1, id2} = req.params;
        const qry1 = `select *
                      from flight_booking
                      where flight_booking_id = ${id1}`;
        const qry2 = `select *
                      from hotel_booking
                      where hotel_booking_id = ${id2}`;
        const flight_info = await pool.query(qry1);
        const hotel_info = await pool.query(qry2);
        res.json({
            flights: flight_info,
            hotels: hotel_info
        });
    } catch (err) {
        console.log(err);
    }
});

//The user should be able to retrieve information of all passengers
// in a booked flights using Flight-booking-id
app.get("passenger-info/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const qry = `select SSN, FirstName, LastName, Date_of_birth, Category
                     from passenger
                              join tickets on passenger.SSN = tickets.SSN
                     where flight_booking_id = ${id}`;
        const passenger_info = await pool.query(qry);
        res.json(passenger_info);
    } catch (err) {
        console.log(err);
    }
});


// the user should be able to retrieve all the information of
// all booked flights and booked hotels for SEP 2024


// the user should be able to retrieve all the information about booked flights
// for specific person using SSN.
app.get("booking-info/:ssn", async (req, res) => {
    try {
        const {ssn} = req.params;
        const qry = `select *
                     from tickets
                     where ssn = ${ssn}`;
        const booking_info = await pool.query(qry);
        res.json(booking_info);
    } catch (err) {
        console.log(err);
    }
});

app.post("/register", async (req, res) => {
    try {
        const reg_data = req.body;

        let queryString = "INSERT INTO users (user_id, FirstName, LastName, Date_of_birth, Gender, Phone_number, Email, Password) VALUES (DEFAULT,'" + reg_data.fname + "','" + reg_data.lname + "','" + reg_data.dob + "','" + reg_data.gender + "','" + reg_data.phone + "','" + reg_data.email + "','" + reg_data.password + "');";
        console.log(queryString);
        console.log(pool.query(queryString));
    } catch (err) {
        console.log(err);
    }
});

app.post("/login", async (req, res) => {
    try {
        const login_data = req.body;
        let queryString = "SELECT user_id FROM users WHERE Phone_number = '" + login_data.phone + "' AND Password = '" + login_data.password + "';";
        console.log(queryString);
        let response = await pool.query(queryString);
        console.log(response.rows[0].user_id);

        res.header('Content-Type', 'text/json');
        if (response.rows[0].user_id) {
            res.send("yes");
            console.log("success");
        }
    } catch (err) {
        console.log(err);
        res.send("no");
        console.log("fail");
    }
});

app.get("/loadHotelDB", async (req, res) => {

    const hoteljson = await fs.readFile('hotel_data.json');
    const hotels = JSON.parse(hoteljson);

    // Insert each hotel into the database
    for (const hotel of hotels) {
        const query = `
            INSERT INTO hotel (hotel_id, hotel_name, city, price_per_night)
            VALUES ($1, $2, $3, $4)
        `;
        const values = [hotel.id, hotel.name, hotel.city, hotel.price];

        try {
            await pool.query(query, values);
            console.log(`Inserted: ${hotel.name} with ID ${hotel.id}`);
        } catch (err) {
            console.error(`Error inserting ${hotel.name} with ID ${hotel.id}:`, err);
        }
    }

    try {
        const result = await pool.query('SELECT * FROM hotel');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
    
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
