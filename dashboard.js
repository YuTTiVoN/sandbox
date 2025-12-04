async function loadData() {
    const res = await fetch("../data/dashboard_data.json");
    const data = await res.json();
    populateFilters(data);
    renderTable(data);
}

function populateFilters(data) {
    const categorySet = new Set();
    const streamerSet = new Set();

    data.forEach(r => {
        if (r.Event_Category) categorySet.add(r.Event_Category);
        if (r.Primary_Streamer) streamerSet.add(r.Primary_Streamer);
    });

    const categoryFilter = document.getElementById("categoryFilter");
    [...categorySet].sort().forEach(c => {
        const op = document.createElement("option");
        op.value = c;
        op.innerText = c;
        categoryFilter.appendChild(op);
    });

    const streamerFilter = document.getElementById("streamerFilter");
    [...streamerSet].sort().forEach(s => {
        const op = document.createElement("option");
        op.value = s;
        op.innerText = s;
        streamerFilter.appendChild(op);
    });
}

function renderTable(data) {
    const tbody = document.querySelector("#results tbody");
    tbody.innerHTML = "";

    data.forEach(row => {
        const tr = document.createElement("tr");
        Object.keys(row).forEach(key => {
            if (key.startsWith("_")) return;
            const td = document.createElement("td");
            td.textContent = row[key];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

document.getElementById("search").addEventListener("input", applyFilters);
document.getElementById("categoryFilter").addEventListener("change", applyFilters);
document.getElementById("streamerFilter").addEventListener("change", applyFilters);
document.getElementById("reset").addEventListener("click", () => {
    document.getElementById("search").value = "";
    document.getElementById("categoryFilter").value = "";
    document.getElementById("streamerFilter").value = "";
    loadData();
});

async function applyFilters() {
    const res = await fetch("../data/dashboard_data.json");
    let data = await res.json();

    const search = document.getElementById("search").value.toLowerCase();
    const cat = document.getElementById("categoryFilter").value;
    const streamer = document.getElementById("streamerFilter").value;

    data = data.filter(r => {
        const text = Object.values(r).join(" ").toLowerCase();
        if (search && !text.includes(search)) return false;
        if (cat && r.Event_Category !== cat) return false;
        if (streamer && r.Primary_Streamer !== streamer) return false;
        return true;
    });

    renderTable(data);
}

loadData();
