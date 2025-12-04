// --- Init (wait for DOM+JSON - gptFix #2) ---
document.addEventListener("DOMContentLoaded", () => {

    fetch("/data/display_subset_v2.json")
        .then(r => r.json())
        .then(data => {
            window.rustEvents = data;
            populateDropdowns(data);
            renderResults(data);
        });

});

// --- Load Data ---
async function loadData() {
    try {
        const response = await fetch("/data/display_subset_v2.json");
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

// --- Populate Dropdowns (gptFix #3) ---
function populateDropdowns(data) {
  const categorySet = new Set();
  const streamerSet = new Set();

  data.forEach(ev => {
    if (ev.Event_Category) categorySet.add(ev.Event_Category);
    if (ev.Primary_Streamer) streamerSet.add(ev.Primary_Streamer);
  });

  const category = document.getElementById("category");
  const streamer = document.getElementById("streamer");

  categorySet.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    category.appendChild(opt);
  });

  streamerSet.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    streamer.appendChild(opt);
  });
}

// --- Render Search Results (gptFix #3) ---
function renderResults(data) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  data.forEach(ev => {
    const card = document.createElement("div");
    card.classList.add("event-card");

    card.innerHTML = `
      <div class="event-title">${ev.Summary || "Untitled Event"}</div>
      <div><strong>Category:</strong> ${ev.Event_Category}</div>
      <div><strong>Streamer:</strong> ${ev.Primary_Streamer}</div>
      <div><a href="${ev.VOD_URL}" target="_blank">Watch VOD</a></div>
    `;

    resultsDiv.appendChild(card);
  });
}

// --- Filtering Logic (gptFix #3) ---
function filterAll() {
  const text = document.getElementById("search").value.toLowerCase();
  const cat = document.getElementById("category").value;
  const str = document.getElementById("streamer").value;

  const filtered = window.rustEvents.filter(ev => {
    const matchesText =
      ev.Summary?.toLowerCase().includes(text) ||
      ev.Event_Category?.toLowerCase().includes(text) ||
      ev.Primary_Streamer?.toLowerCase().includes(text);

    const matchesCat = cat === "all" || ev.Event_Category === cat;
    const matchesStr = str === "all" || ev.Primary_Streamer === str;

    return matchesText && matchesCat && matchesStr;
  });

  renderResults(filtered);
}

// --- Reset Filters (gptFix #3) ---
function filterAll() {
  const text = document.getElementById("search").value.toLowerCase();
  const cat = document.getElementById("category").value;
  const str = document.getElementById("streamer").value;

  const filtered = window.rustEvents.filter(ev => {
    const matchesText =
      ev.Summary?.toLowerCase().includes(text) ||
      ev.Event_Category?.toLowerCase().includes(text) ||
      ev.Primary_Streamer?.toLowerCase().includes(text);

    const matchesCat = cat === "all" || ev.Event_Category === cat;
    const matchesStr = str === "all" || ev.Primary_Streamer === str;

    return matchesText && matchesCat && matchesStr;
  });

  renderResults(filtered);
}

// --- Init (gptFix #2) ---
window.addEventListener("DOMContentLoaded", async () => {
    const data = await loadData();
    window.fullData = data;

    populateDropdowns(data);
    renderResults(data);
});
