

function findFlights(orig, dst, dep, arr, seats) {
    return fetch('flights.xml')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'application/xml');
            const records = xmlDoc.getElementsByTagName('record');

            // upper and lower bounds of input date
            const upperbound = new Date();
            upperbound.setDate(dep.getDate()+3)
            const lowerbound = new Date();
            lowerbound.setDate(dep.getDate()-3)

            // initializing output arrays
            let allFlights = []
            let flightsWithDate = []
            let curr_flight = []

            for (let i = 0; i < records.length; i++) {
                const id = records[i].getElementsByTagName("id")[0].textContent;
                const origin = records[i].getElementsByTagName("origin")[1].textContent;
                const dest = records[i].getElementsByTagName("dest")[2].textContent;
                const dep_date = records[i].getElementsByTagName("dep_date")[3].textContent;
                const arr_date = records[i].getElementsByTagName("arr_date")[4].textContent;
                const dep_time = records[i].getElementsByTagName("dep_time")[5].textContent;
                const arr_time = records[i].getElementsByTagName("arr_time")[6].textContent;
                const num_seats = parseInt(records[i].getElementsByTagName("num_seats")[7].textContent);
                const price = parseInt(records[i].getElementsByTagName("price")[8].textContent);

                // converting text dates in xml to js date types
                let [dep_month, dep_day, dep_year] = dep_date.split("/").map(Number);
                let ddate = new Date(dep_year,dep_month-1, dep_day);
                if (arr_date){
                    let [arr_month, arr_day, arr_year] = arr_date.split("/").map(Number);
                    let adate = new Date(arr_year,arr_month-1, arr_day);
                }

                // checks if everything meets the user input and populates the arrays accordingly
                if (seats>=num_seats && orig===origin && dest===dest && ddate.getDate()>=lowerbound
                    && ddate.getDate() <=upperbound){
                    curr_flight = [id,origin,dest,dep_date,dep_time,arr_date,arr_time,num_seats,price];
                    allFlights.push(curr_flight);
                    if (dep.getDate()===ddate.getDate()){
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