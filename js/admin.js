const port = 4000;

function fetchHotelData() {
    fetch(`http://localhost:${port}/loadHotelDB`)
        .then(response => response.json())
        .then(data => {
            const showHotelOut = document.getElementById('hotelOutDiv');
            showHotelOut.innerHTML = '';
            data.forEach(hotel => {
                const hotelElement = document.createElement('div');
                hotelElement.textContent = `Hotel ID: ${hotel.hotel_id}, Hotel Name: ${hotel.hotel_name}, City: ${hotel.city}, Price per Night: $${hotel.price_per_night}`;
                showHotelOut.appendChild(hotelElement);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

