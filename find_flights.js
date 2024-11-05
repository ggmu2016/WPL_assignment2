

function findFlights(orig, dst, dep, arr, seats) {
    return fetch('flights.xml')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            const records = xmlDoc.getElementsByTagName('record');

            // upper and lower bounds of input date

            const upperbound = new Date();
            upperbound.setDate(dep.getDate()+3);
            const lowerbound = new Date();
            lowerbound.setDate(dep.getDate()-3)

            // initializing output arrays
            let allFlights = []
            let flightsWithDate = []
            let curr_flight = []

            for (let i = 0; i < records.length; i++) {
                const id = records[i].getElementsByTagName("id")[0].textContent;
                const origin = records[i].getElementsByTagName("origin")[0].textContent;
                const dest = records[i].getElementsByTagName("dest")[0].textContent;
                const dep_date = records[i].getElementsByTagName("dep_date")[0].textContent;
                const arr_date = records[i].getElementsByTagName("arr_date")[0].textContent;
                const dep_time = records[i].getElementsByTagName("dep_time")[0].textContent;
                const arr_time = records[i].getElementsByTagName("arr_time")[0].textContent;
                const num_seats = parseInt(records[i].getElementsByTagName("num_seats")[0].textContent);
                const price = parseInt(records[i].getElementsByTagName("price")[0].textContent);

                // converting text dates in xml to js date types
                let [dep_month, dep_day, dep_year] = dep_date.split("/").map(Number);
                let ddate = new Date(dep_year,dep_month-1, dep_day);
                if (arr_date){
                    let [arr_month, arr_day, arr_year] = arr_date.split("/").map(Number);
                    let adate = new Date(arr_year,arr_month-1, arr_day);
                }

                console.log("orig", orig);
                console.log("origin", origin.toLowerCase());
                console.log("dest", dest.toLowerCase());
                console.log("dst", dst);
                console.log("num_seats",num_seats);
                console.log("seats",seats);
                console.log("ddate",ddate);
                console.log("dep",dep)
                if (ddate===dep){
                    console.log("fuck yea mf")
                }
                console.log("lowerbound",lowerbound);
                console.log("upperbound",upperbound);


                // checks if everything meets the user input and populates the arrays accordingly
                if (seats<=num_seats && orig===origin.toLowerCase() && dest.toLowerCase()===dst && ddate.getDate()>=lowerbound
                    && ddate.getDate() <=upperbound){
                    console.log("hello")
                    curr_flight = [id,origin,dest,dep_date,dep_time,arr_date,arr_time,num_seats,price];
                    allFlights.push(curr_flight);
                    if (dep===ddate){
                        flightsWithDate.push(curr_flight);
                    }
                }

            }
            if (flightsWithDate) {
                return flightsWithDate;
            }

            return allFlights;

        })

}