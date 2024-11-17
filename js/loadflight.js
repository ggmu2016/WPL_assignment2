document.addEventListener("DOMContentLoaded", function() {
    helloCart();
})

function helloCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartContainer = document.getElementById("cartContainer");

    console.log("fuck this shit: ", cart)
    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>No flights in the cart.</p>";
    }
    cartContainer.innerHTML = cart.map(flight => `
        <div>
            <p>Origin: ${flight.origin}</p>
            <p>Destination: ${flight.destination}</p>
            <p>Departure date: ${flight.departure_date}</p>
            <p>Departure time: ${flight.departure_time}</p>
            <p>Arrival date: ${flight.arrival_date}</p>
            <p>Arrival time: ${flight.arrival_time}</p>
            <p>Num_seats selected: ${flight.num_seats}</p>
            <p>Price: ${flight.price}</p>
        </div>
    `).join("");
}
helloCart();