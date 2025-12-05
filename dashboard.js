//----------------------------------------------------
// Load JSON + Initialize
//----------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    const data = await loadData();
    window.rustEvents = data;

    displayResults(data);

    wireFilters();
});

async function loadData() {
    try {
        const response = await fetch("/data/display_subset_v2.json");
        if (!response.ok) throw new Error("Failed to load JSON");
        const data = await response.json();
        console.log("Loaded events:", data.length);
        return data;
    } catch (err) {
        console.error("Data error:", err);
        return [];
    }
}

//----------------------------------------------------
// DOM Elements
//----------------------------------------------------
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const streamerSelect = document.getElementById("streamer");
const resultsDiv = document.getElementById("results");

//----------------------------------------------------
// Populate TABLE Based on Actual JSON Keys
//----------------------------------------------------
function displayResults(results) {
    const tbody = document.getElementById("events-body");
    tbody.innerHTML = "";

    results.forEach((event, index) => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${event.date || ""}</td>
            <td>${event.event_category || ""}</td>
            <td>
              <span class="chip chip-streamer streamer-${event.primary_streamer}">
                ${event.primary_streamer}
              </span>
            </td>
            <td>
              <span class="chip chip-location location-${event.location_combined}">
                ${event.location_combined}
              </span>
            </td>
            <td>${event.summary || ""}</td>
            <td>
              <button class="details-btn" data-index="${index}">View</button>
            </td>
        `;

        tbody.appendChild(tr);

        /* --- hidden details row --- */
        const detailsRow = document.createElement("tr");
        detailsRow.className = "details-row";
        detailsRow.style.display = "none";

        detailsRow.innerHTML = `
            <td colspan="6" class="details-cell">
                <strong>Activities:</strong> ${event.activity}<br><br>
                <strong>Involved Streamers:</strong> ${event.involved_streamers}<br><br>
                <strong>Raw JSON:</strong><br>
                <pre>${JSON.stringify(event, null, 2)}</pre>
            </td>
        `;

        tbody.appendChild(detailsRow);
    });

    /* --- Attach detail button listeners --- */
    document.querySelectorAll(".details-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const rowIndex = Number(btn.dataset.index);
            const details = tbody.querySelectorAll(".details-row")[rowIndex];
            
            const isVisible = details.style.display === "table-row";

            details.style.display = isVisible ? "none" : "table-row";
            btn.textContent = isVisible ? "View" : "Hide";
        });
    });
}
