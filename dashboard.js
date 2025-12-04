//----------------------------------------------------
// Load JSON + Initialize
//----------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    const data = await loadData();
    window.rustEvents = data;

    populateDropdowns(data);
    renderResults(data);

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
// Populate Dropdowns Based on Actual JSON Keys
//----------------------------------------------------
function populateDropdowns(data) {
    const catSet = new Set();
    const streamSet = new Set();

    data.forEach(ev => {
        if (ev.event_category) catSet.add(ev.event_category);
        if (ev.primary_streamer) streamSet.add(ev.primary_streamer);
    });

    // Add category options
    catSet.forEach(category => {
        const opt = document.createElement("option");
        opt.value = category;
        opt.textContent = category;
        categorySelect.appendChild(opt);
    });

    // Add streamer options
    streamSet.forEach(streamer => {
        const opt = document.createElement("option");
        opt.value = streamer;
        opt.textContent = streamer;
        streamerSelect.appendChild(opt);
    });
}

//----------------------------------------------------
// Rendering Cards
//----------------------------------------------------
function renderResults(data) {
    resultsDiv.innerHTML = "";

    if (!data.length) {
        resultsDiv.innerHTML = `<div class="no-results">No matching events found.</div>`;
        return;
    }

    data.forEach(ev => {
        const card = document.createElement("div");
        card.classList.add("event-card");

        card.innerHTML = `
            <div class="event-title">${ev.summary || "Untitled Event"}</div>
            <div><strong>Category:</strong> ${ev.event_category || "—"}</div>
            <div><strong>Activity:</strong> ${ev.activity || "—"}</div>
            <div><strong>Streamer:</strong> ${ev.primary_streamer || "—"}</div>
            <div><strong>Location:</strong> ${ev.location_combined || "—"}</div>
        `;

        resultsDiv.appendChild(card);
    });
}

//----------------------------------------------------
// Filtering Logic — patched to match JSON keys
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

    renderResults(filtered);
}

//----------------------------------------------------
// Wire up controls
//----------------------------------------------------
function wireFilters() {
    searchInput.addEventListener("input", filterAll);
    categorySelect.addEventListener("change", filterAll);
    streamerSelect.addEventListener("change", filterAll);

    document.getElementById("reset").addEventListener("click", () => {
        searchInput.value = "";
        categorySelect.value = "all";
        streamerSelect.value = "all";
        renderResults(window.rustEvents);
    });
}
