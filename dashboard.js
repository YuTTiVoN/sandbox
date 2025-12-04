// --- Load Data ---
async function loadData() {
    try {
        const response = await fetch("./data/display_subset_v2.json");
        if (!response.ok) throw new Error("Failed to load JSON");
        const data = await response.json();
        console.log("Loaded events:", data.length);
        return data;
    } catch (err) {
        console.error("Data load error:", err);
        return [];
    }
}

// --- DOM Elements ---
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const streamerSelect = document.getElementById("streamer");
const resultsDiv = document.getElementById("results");

// --- Populate Dropdowns ---
function populateDropdowns(data) {
    const categories = new Set();
    const streamers = new Set();

    data.forEach(item => {
        if (item.EVENT_CATEGORY) categories.add(item.EVENT_CATEGORY);
        if (item.PRIMARY_STREAMER) streamers.add(item.PRIMARY_STREAMER);
    });

    // Sort, then add to category dropdown
    [...categories].sort().forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        categorySelect.appendChild(opt);
    });

    // Sort, then add to streamer dropdown
    [...streamers].sort().forEach(str => {
        const opt = document.createElement("option");
        opt.value = str;
        opt.textContent = str;
        streamerSelect.appendChild(opt);
    });
}

// --- Render Results ---
function renderResults(data) {
    resultsDiv.innerHTML = "";

    if (data.length === 0) {
        resultsDiv.textContent = "No matching events found.";
        return;
    }

    data.forEach(item => {
        const div = document.createElement("div");
        div.className = "result-item";

        div.innerHTML = `
            <h3>${item.SUMMARY || "Untitled Event"}</h3>
            <p><strong>Category:</strong> ${item.EVENT_CATEGORY || "N/A"}</p>
            <p><strong>Streamer:</strong> ${item.PRIMARY_STREAMER || "Unknown"}</p>
            <p><strong>Biome:</strong> ${item.BIOME || "Unknown"}</p>
            <p><strong>Date:</strong> ${item.DATE || "Unknown"}</p>
        `;

        resultsDiv.appendChild(div);
    });
}

// --- Filtering Logic ---
function filterData() {
    let filtered = window.fullData;

    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;
    const selectedStreamer = streamerSelect.value;

    filtered = filtered.filter(item => {
        const matchesSearch =
            !searchTerm ||
            JSON.stringify(item).toLowerCase().includes(searchTerm);

        const matchesCategory =
            selectedCategory === "all" ||
            item.EVENT_CATEGORY === selectedCategory;

        const matchesStreamer =
            selectedStreamer === "all" ||
            item.PRIMARY_STREAMER === selectedStreamer;

        return matchesSearch && matchesCategory && matchesStreamer;
    });

    renderResults(filtered);
}

// --- Reset Filters ---
document.getElementById("reset").onclick = () => {
    searchInput.value = "";
    categorySelect.value = "all";
    streamerSelect.value = "all";
    renderResults(window.fullData);
};

// --- Init ---
window.addEventListener("DOMContentLoaded", async () => {
    const data = await loadData();
    window.fullData = data;

    populateDropdowns(data);
    renderResults(data);
});
