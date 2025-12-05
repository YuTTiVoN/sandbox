document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("eventsTableBody");

    try {
        const response = await fetch("/main/data/display_subset_v2.json");
        const events = await response.json();
        console.log("Loaded events:", events.length);

        renderTable(events);

        // Enable search
        const searchBox = document.getElementById("searchBox");
        searchBox.addEventListener("input", () => {
            const value = searchBox.value.toLowerCase();
            const filtered = events.filter(e =>
                JSON.stringify(e).toLowerCase().includes(value)
            );
            renderTable(filtered);
        });

        // Reset button
        document.getElementById("resetBtn").addEventListener("click", () => {
            searchBox.value = "";
            renderTable(events);
        });

    } catch (err) {
        console.error("Error loading events:", err);
    }
});

function renderTable(events) {
    const tableBody = document.getElementById("eventsTableBody");
    tableBody.innerHTML = "";

    events.forEach(event => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${event.date}</td>
            <td>${event.event_category}</td>
            <td>${event.activity}</td>
            <td>${event.primary_streamer}</td>
            <td>${event.location_combined}</td>
            <td>${event.summary}</td>
        `;

        tableBody.appendChild(row);
    });
}
