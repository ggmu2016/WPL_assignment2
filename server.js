const express = require("express");
const fs = require("fs").promises;
const app = express();
const port = 3000;
// parse XML
const xml2js =require("xml2js")
const cors = require("cors")

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());

const xmlFilePath = "xml/data.xml";
const jsonFilePath = "json/data.json";

// function to read and parse XML
async function readXMLFile(){
    const data = await fs.readFile(xmlFilePath);
    return xml2js.parseStringPromise(data);
}

// write updated XML back to file
async function writeXMLFile(data){
    return new Promise((resolve, reject) => {
        const builder = new xml2js.Builder();
        const xml = builder.buildObject(data);
        fs.writeFile(xmlFilePath, xml, (err) => {
            if (err) {reject(err)}
            resolve();
        });
    });
}

// function to read and parse JSON
async function readJSONFile(){
    const data = await fs.readFile(jsonFilePath);
    return JSON.stringify(data);
}

// write updated JSON back to file
async function writeJSONFile(data){
    return new Promise((resolve, reject) => {
        fs.writeFile(jsonFilePath, data, (err) => {
            if (err) {reject(err)}
            resolve();
        });
    });
}

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
            lowerBound.setDate(userDepDate.getDate()-3);
            const upperBound = new Date(userDepDate);
            upperBound.setDate(userDepDate.getDate()+3);

            return(
                    originFlight === origin.toLowerCase() &&
                    destinationFlight === destination.toLowerCase() &&
                    numSeats >= parseInt(seats) &&
                        depDate >=lowerBound &&
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
    try{
        const {flightId, seatsToBook} = req.body;
        const xmlData = await readXMLFile();

        //find flight by id
        const records = Array.from(xmlData.dataset.record);
        const flight = records.find(f=> f.flight_id[0] === flightId);

        if (!flight) {
            return res.status(400).send("No flight found.");
        }
        const availableSeats = parseInt(flight.num_seats[0]);
        if (availableSeats<seatsToBook) {
            return res.status(400).send("Not enough seats found.");
        }

        //updating number of available seats
        flight.num_seats[0] = (availableSeats - seatsToBook).toString();

        await writeXMLFile(xmlData);
        res.json({message: "Seats updated successfully.", updatedFlight: flight});

    } catch (err){
        console.log(err);
    }
});

app.post("/update-json", async (req, res) => {
    try{
        const customer_data = req.body;

        await writeJSONFile(JSON.stringify(customer_data));
    } catch (err){
        console.log(err);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
