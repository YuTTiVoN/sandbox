// ============================================================
// Rust Dashboard - Clean Working Version
// ============================================================

// --------- Load JSON Data ---------
async function loadData() {
    try {
        const response = await fetch("./data/display_subset_v2.json");
        if (!response.ok) throw new Error("Failed to load JSON");
        const data = await response.json();
        console.log("Loaded events:", data.length);
        return data;
    } catch (err) {
        console.error("Data Load Error:", err);
        return [];
    }
}

// --------- DOM Elements ---------
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const streamerSelect = document.getElementById("streamer");
const resultsDiv = document.getElementById("results");

// --------- Populate Dropdowns ---------
function populateDropdowns(data) {
    const categorySet = new Set();
    const streamerSet = new Set();

    data.forEach(ev => {
        if (ev.Event_Category) categorySet.add(ev.Event_Category);
        if (ev.Primary_Streamer) streamerSet.add(ev.Primary_Streamer);
    });

    // Insert default options
    categorySelect.innerHTML = `<option value="all">All Categories</option>`;
    streamerSelect.innerHTML = `<option value="all">All Primary Streamers</option>`;

    categorySet.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        categorySelect.appendChild(opt);
    });

    streamerSet.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        streamerSelect.appendChild(opt);
    });
}

// --------- Render Results ---------
function renderResults(data) {
    resultsDiv.innerHTML = "";

    if (!data.length) {
        resultsDiv.innerHTML = `<p class="no-results">No matching events found.</p>`;
        return;
    }

    data.forEach(ev => {
        const card = document.createElement("div");
        card.classList.add("event-card");

        const title = ev.Summary || "Untitled Event";
        const category = ev.Event_Category || "Uncategorized";
        const streamer = ev.Primary_Streamer || "Unknown";
        const vod = ev.VOD_URL && ev.VOD_URL.startsWith("http")
            ? ev.VOD_URL
            : null;

        card.innerHTML = `
            <div class="event-title">${title}</div>
            <div><strong>Category:</strong> ${category}</div>
            <div><strong>Streamer:</strong> ${streamer}</div>
            <div>
                ${vod ? `<a href="${vod}" target="_blank">Watch VOD</a>` : `<span class="no-vod">No VOD Available</span>`}
            </div>
        `;

        resultsDiv.appendChild(card);
    });
}

// --------- Filtering Logic ---------
function filterAll() {
    const text = searchInput.value.toLowerCase();
    const cat = categorySelect.value;
    const str = streamerSelect.value;

    const filtered = window.rustEvents.filter(ev => {
        const matchesText =
            (ev.Summary?.toLowerCase().includes(text)) ||
            (ev.Event_Category?.toLowerCase().includes(text)) ||
            (ev.Primary_Streamer?.toLowerCase().includes(text));

        const matchesCat = cat === "all" || ev.Event_Category === cat;
        const matchesStr = str === "all" || ev.Primary_Streamer === str;

        return matchesText && matchesCat && matchesStr;
    });

    renderResults(filtered);
}

// --------- Reset Filters ---------
function resetFilters() {
    searchInput.value = "";
    categorySelect.value = "all";
    streamerSelect.value = "all";

    renderResults(window.rustEvents);
}

// --------- Event Listeners ---------
searchInput.addEventListener("input", filterAll);
categorySelect.addEventListener("change", filterAll);
streamerSelect.addEventListener("change", filterAll);

document.getElementById("reset-btn")?.addEventListener("click", resetFilters);

// --------- Initialize Dashboard ---------
window.addEventListener("DOMContentLoaded", async () => {
    const data = await loadData();
    window.rustEvents = data;

    populateDropdowns(data);
    renderResults(data);
});
