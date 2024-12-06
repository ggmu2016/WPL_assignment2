const express = require("express");
const fs = require("fs").promises;
const app = express();
const port = 4000;
// parse XML
const xml2js = require("xml2js")

const cors = require("cors")
const {Client} = require("pg");

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());

const xmlFilePath = "xml/data.xml";
const comments_xmlFilePath = "xml/comments.xml";
const jsonFilePath = "json/data.json";


// set up connection with database (postgres)
const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    password: null,
    host: "localhost",
    port: 5432,
    database: "webprogram"
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
app.get(`/passenger-info`, async (req, res) => {
    const jsonData = await readJSONFile();
    res.json(jsonData);
})


// API route to search for flights
app.get(`/search-flights`, async (req, res) => {
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
app.post(`/book-flight`, async (req, res) => {
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

app.post(`/update-json`, async (req, res) => {
    try {
        const customer_data = req.body;

        await writeJSONFile(JSON.stringify(customer_data, null, 2));
    } catch (err) {
        console.log(err);
    }
});


//The user should be able to retrieve all the information about
// booked flights and booked hotels using hotel-booking id and Flight-booking-id
app.get(`/booking-info/:id1/:id2`, async (req, res) => {
    try {
        const {id1, id2} = req.params;
        let flight_info = null;
        if (id1) {
            const qry1 = `select flight_booking.flight_id, origin, destination, departure_date, departure_time, arrival_date, arrival_time, total_price
                      from flight_booking 
                      join flights on flight_booking.flight_id=flights.flight_id
                      where flight_booking_id = ${id1}`;
            flight_info = await pool.query(qry1);
        }
        let hotel_info = null;
        if (id2) {
            const qry2 = `select *
                      from hotel_booking
                      where hotel_booking_id = ${id2}`;

            hotel_info = await pool.query(qry2);
        }
        let hotel_info_rows = null;
        let flight_info_rows = null;

        if (flight_info){
            flight_info_rows = flight_info.rows;
        }
        if (hotel_info){
            hotel_info_rows = hotel_info.rows;
        }

        res.json({
            flights: flight_info_rows,
            hotels: hotel_info_rows
        });
        console.log(res)
    } catch (err) {
        console.log(err);
    }
});

//The user should be able to retrieve information of all passengers
// in a booked flights using Flight-booking-id
app.get(`/passenger-info/:id`, async (req, res) => {
    try {
        const {id} = req.params;
        const qry = `select passenger.SSN, FirstName, LastName, Date_of_birth, Category
                     from passenger
                              join tickets on passenger.SSN = tickets.SSN
                     where flight_booking_id = ${id}`;
        const passenger_info = await pool.query(qry);
        res.json(passenger_info.rows);
    } catch (err) {
        console.log(err);
    }
});


// the user should be able to retrieve all the information of
// all booked flights and booked hotels for SEP 2024


// the user should be able to retrieve all the information about booked flights
// for specific person using SSN.
app.get("/booking-info/:ssn", async (req, res) => {
    try {
        const {ssn} = req.params;
        const ssnString = String(ssn);
        const qry = `select *
                     from tickets 
                     join flight_booking on tickets.flight_booking_id = flight_booking.flight_booking_id
                     join flights on flights.flight_id = flight_booking.flight_id
                     where ssn = $1`;
        const booking_info = await pool.query(qry,[ssnString]);
        res.json(booking_info.rows);
    } catch (err) {
        console.log(err);
    }
});

// add ticket info
app.post(`/add-ticket`, async (req, res) => {
    try{
        const {flight_booking_id, ssn, price} = req.body;
        const qry = `INSERT INTO tickets (flight_booking_id, SSN, price) VALUES ($1, $2, $3)`;
        await pool.query(qry,[flight_booking_id,ssn,price]);
        res.status(201).send('Ticket added successfully.');
    } catch (error) {
        console.log("error adding tickets:", error);
        res.status(200).send("Failed to add tix")
    }
});

// admin add flights from XML to the database
app.post("/insert-flights", async (req, res) => {
    try{
        // read and parse xml file
        const data = await fs.readFile(xmlFilePath, 'utf8');
        const parsedData = await xml2js.parseStringPromise(data);

        // extract flight records from xml
        const flights = parsedData.dataset.record;
        //console.log('parsed flights:', flights);

        for (const flight of flights) {
            const query = `insert into flights values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`;
            const values = [
                flight.flight_id[0],
                flight.origin[0],
                flight.destination[0],
                flight.departure_date[0],
                flight.arrival_date[0],
                flight.departure_time[0],
                flight.arrival_time[0],
                parseInt(flight.num_seats[0]),
                parseInt(flight.price[0])
            ];
            try {
                await pool.query(query, values)
                console.log(`Inserted: ${flight.name} with ID ${flight.id}`);
            }catch(error){
                console.log(`Error inserting ${flight.name} with ID ${flight.id}:`,error);
            }
        }
    }catch (err){
        console.log("Error inserting xml flights",err);
    }
})

// generate unique contact id
function generateContactID(){
    return Math.floor(Math.random()*1000000);
}

// Handle comment submission
app.post("/submit-comment", async (req, res) => {
    try {
        const {firstName, lastName, dob, phone, email, gender, comment} = req.body;

        // read existing XML data or create new xml file
        let xmlData;
        try {
            const fileContent = await fs.readFile(comments_xmlFilePath, 'utf8');
            xmlData = await xml2js.parseStringPromise(fileContent);
        } catch {
            // if file does not exist initialize new file structure
            console.log("File does not exist. Initializing new XML structure.");
            xmlData = { comments: { comment: [] } };
        }

        // Ensure `comments` and `comment` arrays are properly initialized
        if (!xmlData.comments) {
            xmlData.comments = { comment: [] };
        }
        if (!Array.isArray(xmlData.comments.comment)) {
            xmlData.comments.comment = [];
        }

        const contactID = generateContactID();
        const newComment = {
            contact_id: contactID,
            firstName,
            lastName,
            dob,
            phone,
            email,
            gender,
            comment
        };

        xmlData.comments.comment.push(newComment);

        // converting updated data back to xml
        const builder = new xml2js.Builder();
        const updatedXML = builder.buildObject(xmlData);
        await fs.writeFile(comments_xmlFilePath, updatedXML);

        console.log("Comment submitted successfully: ", contactID);
        res.status(200).json({ message: "Comment submitted successfully.", contactID });

    }catch (err){
        console.error("Error handling comment submission: ", err);
        res.status(500).json({ error: "Failed to submit comment." });
    }

})

// Add passenger endpoint
app.post('/add-passenger', async (req, res) => {
    try {
        const { fname, lname, dob, ssn, category } = req.body;
        const query = `INSERT INTO passenger (SSN, FirstName, LastName, Date_of_birth, Category) VALUES ($1, $2, $3, $4, $5)`;
        await pool.query(query, [ssn, fname, lname, dob, category]);
        res.status(200).send('Passenger added successfully');
    } catch (error) {
        console.error('Error adding passenger:', error);
        res.status(500).send('Failed to add passenger');
    }
});

// Add flight booking endpoint
app.post('/add-flight-booking', async (req, res) => {
    try {
        const {flight_id, total_price } = req.body;
        const query = `INSERT INTO flight_booking (flight_id, total_price) VALUES ($1, $2) RETURNING flight_booking_id`;
        const result = await pool.query(query, [flight_id, total_price]);
        res.status(200).json({flight_booking_id:result.rows[0].flight_booking_id})
    } catch (error) {
        console.error('Error adding flight booking:', error);
        res.status(500).send('Failed to add flight booking');
    }
});

// register user
app.post(`/register`, async (req, res) => {
    try {
        const reg_data = req.body;

        let queryString = "INSERT INTO users (user_id, FirstName, LastName, Date_of_birth, Gender, Phone_number, Email, Password) VALUES (DEFAULT,'" + reg_data.fname + "','" + reg_data.lname + "','" + reg_data.dob + "','" + reg_data.gender + "','" + reg_data.phone + "','" + reg_data.email + "','" + reg_data.password + "');";
        console.log(queryString);
        console.log(pool.query(queryString));
    } catch (err) {
        console.log(err);
    }
});

app.post(`/login`, async (req, res) => {
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

app.get(`/loadHotelDB`, async (req, res) => {

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

// ADMIN QUERIES
app.post("/dynamic-query", async (req, res) => {
    try {
        const { queryType, params } = req.body;

        let qry;
        switch (queryType) {
            case "allBookedFlightsFromTexas":
                qry = `
                    SELECT tickets.ticket_id, flight_booking.flight_booking_id, flights.flight_id, origin, destination, departure_date, departure_time
                    FROM tickets
                    JOIN flight_booking ON tickets.flight_booking_id = flight_booking.flight_booking_id
                    JOIN flights ON flights.flight_id = flight_booking.flight_id
                    WHERE LOWER(origin) IN ('austin', 'dallas','houston', 'san antonio')
                      AND departure_date BETWEEN '2024-09-01' AND '2024-10-31';
                `;
                break;
            case "bookedFlightsWithInfants":
                qry = `
                    SELECT tickets.ticket_id, flight_booking.flight_booking_id, flights.flight_id, origin, destination, departure_date, departure_time
                    FROM tickets
                    JOIN flight_booking ON tickets.flight_booking_id = flight_booking.flight_booking_id
                    JOIN flights ON flights.flight_id = flight_booking.flight_id
                    WHERE tickets.ssn IN (
                        SELECT ssn FROM passenger WHERE category = 'infants'
                    );
                `;
                break;
            case "bookedFlightsWithInfantsAndChildren":
                qry = `
                    SELECT tickets.ticket_id, flight_booking.flight_booking_id, flights.flight_id, origin, destination, departure_date, departure_time
                    FROM tickets
                    JOIN flight_booking ON tickets.flight_booking_id = flight_booking.flight_booking_id
                    JOIN flights ON flights.flight_id = flight_booking.flight_id
                    WHERE tickets.ssn IN (
                        SELECT ssn FROM passenger WHERE category = 'infants'
                    ) AND (
                        SELECT COUNT(*) 
                        FROM passenger 
                        WHERE category = 'children' 
                        AND passenger.ssn = tickets.ssn
                    ) >= 5;
                `;
                break;
            case "mostExpensiveBookedFlights":
                qry = `
                    SELECT tickets.*, flight_booking.*, flights.*
                    FROM tickets
                    JOIN flight_booking ON tickets.flight_booking_id = flight_booking.flight_booking_id
                    JOIN flights ON flights.flight_id = flight_booking.flight_id
                    ORDER BY flight_booking.total_price DESC
                    LIMIT 5;
                `;
                break;
            case "flightsFromTexasNoInfants":
                qry = `
                    SELECT tickets.ticket_id, flight_booking.flight_booking_id, flights.flight_id, origin, destination, departure_date, departure_time
                    FROM tickets
                    JOIN flight_booking ON tickets.flight_booking_id = flight_booking.flight_booking_id
                    JOIN flights ON flights.flight_id = flight_booking.flight_id
                    WHERE LOWER(origin) IN ('austin', 'dallas','houston', 'san antonio')
                      AND NOT EXISTS (
                          SELECT * FROM passenger
                          WHERE passenger.category = 'infants'
                          AND passenger.ssn = tickets.ssn
                      );
                `;
                break;
            case "numberOfFlightsToCalifornia":
                qry = `
                    SELECT COUNT(*) AS flight_count
                    FROM flights
                    JOIN flight_booking ON flights.flight_id = flight_booking.flight_id
                    WHERE LOWER(destination) IN ('san diego', 'los angeles', 'san francisco', 'sacramento', 'fresno')
                      AND departure_date BETWEEN '2024-09-01' AND '2024-10-31';
                `;
                break;
            default:
                return res.status(400).send("Invalid query type");
        }

        const result = await pool.query(qry, params || []);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error executing query");
    }
});





// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
