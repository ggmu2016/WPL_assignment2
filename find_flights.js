function findFlights(orig, dst, dep, seats) {
    return fetch('xml/data.xml')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            const records = xmlDoc.getElementsByTagName('record');

            // upper and lower bounds of input date

            const dep_month = dep.getMonth();
            const dep_year = dep.getFullYear();
            const dep_day = dep.getDate();

            const upperbound = new Date(dep_year, dep_month, dep_day + 3);
            const lowerbound = new Date(dep_year, dep_month, dep_day - 3);


            // initializing output arrays
            let allFlights = []
            let flightsWithDate = []
            let curr_flight = []

            for (let i = 0; i < records.length; i++) {
                const id = records[i].getElementsByTagName("flight_id")[0].textContent;
                const origin = records[i].getElementsByTagName("origin")[0].textContent;
                const dest = records[i].getElementsByTagName("destination")[0].textContent;
                const dep_date = records[i].getElementsByTagName("departure_date")[0].textContent;
                const arr_date = records[i].getElementsByTagName("arrival_date")[0].textContent;
                const dep_time = records[i].getElementsByTagName("departure_time")[0].textContent;
                const arr_time = records[i].getElementsByTagName("arrival_time")[0].textContent;
                const num_seats = parseInt(records[i].getElementsByTagName("num_seats")[0].textContent);
                const price = parseInt(records[i].getElementsByTagName("price")[0].textContent);

                // converting text dates in xml to js date types
                let [dep_month, dep_day, dep_year] = dep_date.split("/").map(Number);
                let ddate = new Date(dep_year, dep_month - 1, dep_day);


                // console.log("orig", orig);
                // console.log("origin", origin.toLowerCase());
                // console.log("dest", dest.toLowerCase());
                // console.log("dst", dst);
                // console.log("num_seats",num_seats);
                // console.log("seats",seats);
                // console.log("ddate",ddate);
                // console.log("dep",dep)
                // console.log("lowerbound",lowerbound);
                // console.log("upperbound",upperbound);
                //
                // if (ddate>=lowerbound && ddate<=upperbound){
                //     console.log("fuck yall bitches");
                // }


                // checks if everything meets the user input and populates the arrays accordingly
                if (seats <= num_seats && orig === origin.toLowerCase() && dest.toLowerCase() === dst && ddate >= lowerbound
                    && ddate <= upperbound) {
                    curr_flight = [id, origin, dest, dep_date, dep_time, arr_date, arr_time, num_seats, price];
                    allFlights.push(curr_flight);
                    if (dep.getMonth() === ddate.getMonth() && dep.getDate() === ddate.getDate() && dep.getFullYear() === ddate.getFullYear()) {
                        flightsWithDate.push(curr_flight);
                    }
                }

                // console.log(flightsWithDate);
                // console.log(allFlights);

            }
            if (flightsWithDate.length >= 1) {
                return flightsWithDate;
            } else if (allFlights.length >= 1) {
                return allFlights;
            } else {
                console.log("Sorry. No flights found.")
            }
        })

}