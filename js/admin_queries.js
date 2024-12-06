// Helper function to get a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Function to control the visibility of the admin section
function showAdminSection() {
    const loginid = getCookie("loginid");
    const adminSection = document.getElementById("admin-queries-section");

    // Check if the loginId matches the required phone number
    if (loginid === "000-000-0000") {
        adminSection.style.display = "block";
    } else {
        adminSection.style.display = "none";
        console.warn("Access denied: Invalid loginId or not logged in.");
    }
}

// Run this function on page load
document.addEventListener("DOMContentLoaded", ()=>{
    showAdminSection();
    checkCookie();
});

async function runQuery(queryType) {
    const port = 4000; // Ensure this matches your server's port
    const table = document.querySelector("#dynamic-table");
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    try {
        const response = await fetch(`http://localhost:${port}/dynamic-query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ queryType }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle empty data
        if (!data || data.length === 0) {
            alert("No data found for this query.");
            table.style.display = "none";
            return;
        }

        // Clear previous table content
        thead.innerHTML = "";
        tbody.innerHTML = "";

        // Dynamically generate table headers from data keys
        const keys = Object.keys(data[0]);
        const headerRow = document.createElement("tr");
        keys.forEach(key => {
            const th = document.createElement("th");
            th.textContent = key; // Use key as the header name
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Populate table rows
        data.forEach(row => {
            const tr = document.createElement("tr");
            keys.forEach(key => {
                const td = document.createElement("td");
                td.textContent = row[key]; // Use row's value for each key
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        // Show the table
        table.style.display = "table";
    } catch (error) {
        console.error("Error running query:", error);
        alert("An error occurred while fetching data. Please try again.");
    }
}
