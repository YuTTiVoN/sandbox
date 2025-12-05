//----------------------------------------------------
// Load JSON + Initialize
//----------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    const data = await loadData();
    window.rustEvents = data;

    populateDropdowns(data);
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

//----------------------------------------------------
// Populate Dropdowns
//----------------------------------------------------
function populateDropdowns(data) {
    const catSet = new Set();
    const streamSet = new Set();

    data.forEach(ev => {
        if (ev.event_category) catSet.add(ev.event_category);
        if (ev.primary_streamer) streamSet.add(ev.primary_streamer);
    });

    catSet.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        categorySelect.appendChild(opt);
    });

    streamSet.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        streamerSelect.appendChild(opt);
    });
}

//----------------------------------------------------
// TABLE RENDERING
//----------------------------------------------------
function displayResults(results) {
    const tbody = document.getElementById("events-body");
    tbody.innerHTML = "";

    if (!results.length) {
        tbody.innerHTML = `<tr><td colspan="6">No matching events.</td></tr>`;
        return;
    }

    results.forEach((ev, idx) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${ev.date || ""}</td>
            <td>${ev.event_category || ""}</td>
            <td>
              <span class="chip chip-streamer streamer-${ev.primary_streamer}">
                ${ev.primary_streamer}
              </span>
            </td>
            <td>
              <span class="chip chip-location location-${ev.location_combined}">
                ${ev.location_combined}
              </span>
            </td>
            <td>${ev.summary || ""}</td>
            <td><button class="details-btn" data-index="${idx}">View</button></td>
        `;

        tbody.appendChild(tr);

        // details row
        const details = document.createElement("tr");
        details.className = "details-row";
        details.style.display = "none";
        details.innerHTML = `
            <td colspan="6" class="details-cell">
                <strong>Activities:</strong> ${ev.activity}<br><br>
                <strong>Involved:</strong> ${ev.involved_streamers}<br><br>
                <pre>${JSON.stringify(ev, null, 2)}</pre>
            </td>
        `;
        tbody.appendChild(details);
    });

    // add listeners
    document.querySelectorAll(".details-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = btn.dataset.index;
            const details = document.querySelectorAll(".details-row")[idx];

            const open = details.style.display === "table-row";
            details.style.display = open ? "none" : "table-row";
            btn.textContent = open ? "View" : "Hide";
        });
    });
}

//----------------------------------------------------
// Filtering
//----------------------------------------------------
function filterAll() {
    const text = searchInput.value.toLowerCase();
    const cat = categorySelect.value;
    const str = streamerSelect.value;

    const filtered = window.rustEvents.filter(ev => {
        const matchesText =
            (ev.summary || "").toLowerCase().includes(text) ||
            (ev.event_category || "").toLowerCase().includes(text) ||
            (ev.primary_streamer || "").toLowerCase().includes(text);

        const matchesCat = cat === "all" || ev.event_category === cat;
        const matchesStr = str === "all" || ev.primary_streamer === str;

        return matchesText && matchesCat && matchesStr;
    });

    displayResults(filtered);
}

//----------------------------------------------------
// Wire events
//----------------------------------------------------
function wireFilters() {
    searchInput.addEventListener("input", filterAll);
    categorySelect.addEventListener("change", filterAll);
    streamerSelect.addEventListener("change", filterAll);

    document.getElementById("reset").addEventListener("click", () => {
        searchInput.value = "";
        categorySelect.value = "all";
        streamerSelect.value = "all";
        displayResults(window.rustEvents);
    });
}
