import pandas as pd
import json
from pathlib import Path

# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------
ROOT = Path(__file__).resolve().parents[1]
RAW_FILE = ROOT / "data" / "rust_raw_data_v3.xlsx"
OUTPUT_JSON = ROOT / "data" / "dashboard_data.json"
REMASTERED = ROOT / "data" / "reorganized_master_v2.xlsx"
DISPLAY = ROOT / "data" / "display_subset_v2.xlsx"

# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------
def safe_split(value):
    if pd.isna(value) or value == "":
        return []
    return [v.strip() for v in str(value).replace(";", ",").split(",") if v.strip()]

# ---------------------------------------------------------
# Load the two sheets
# ---------------------------------------------------------
print("Loading workbook...")
df_raw = pd.read_excel(RAW_FILE, sheet_name="rawData")
df_stream = pd.read_excel(RAW_FILE, sheet_name="streamerData")

# Normalize keys
df_stream.columns = ["ROLEPLAY_NAME", "STREAMER_NAME", "SOCIALS"]

# Build lookup dictionary
lookup = {
    str(row.ROLEPLAY_NAME).strip().lower(): str(row.SOCIALS).strip()
    for _, row in df_stream.iterrows()
}

def lookup_social(name):
    key = str(name).strip().lower()
    return lookup.get(key, "??")

# ---------------------------------------------------------
# STEP 1 — Build reorganized_master_v2
# ---------------------------------------------------------
df = df_raw.copy()

# Combine subtypes into Activity
df["Activity"] = (
    df["Event_Subtype1"].fillna("")
    + "," + df["Event_Subtype2"].fillna("")
    + "," + df["Event_Subtype3"].fillna("")
)
df["Activity"] = df["Activity"].apply(
    lambda x: ",".join([v.strip() for v in x.split(",") if v.strip()])
)

# Build URL lists from Involved_Streamers
urls = []
for row in df["Involved_Streamers"]:
    names = safe_split(row)
    urls.append(",".join([lookup_social(n) for n in names]))

df["Involved_Streamers_URL"] = urls

# Save reorganized_master_v2
df.to_excel(REMASTERED, index=False)

# ---------------------------------------------------------
# STEP 2 — Build display_subset_v2
# ---------------------------------------------------------
df_display = pd.DataFrame()
df_display["Date"] = df["Date"]
df_display["Event_Category"] = df["Event_Category"]
df_display["Activity"] = df["Activity"]
df_display["Primary_Streamer"] = df["Primary_Streamer"]
df_display["Involved_Streamers"] = df["Involved_Streamers"]

# Merge location + biome
def loc_merge(row):
    if pd.isna(row["Biome"]) or row["Biome"] == "??":
        return row["Location"]
    return f"{row['Location']} ({row['Biome']})"

df_display["Location"] = df.apply(loc_merge, axis=1)
df_display["Summary"] = df["Summary"]
df_display["Timestamp"] = df["Timestamp"]

# Faux-hidden
df_display["_Involved_Streamers_URL"] = df["Involved_Streamers_URL"]
df_display["_FixedSort"] = df["FixedSort"]
df_display["_VOD_ID"] = df["VOD_ID"]
df_display["_PLATFORM"] = df["PLATFORM"]
df_display["_VOD_URL"] = df["VOD_URL"]

df_display.to_excel(DISPLAY, index=False)

# ---------------------------------------------------------
# STEP 3 — Export JSON for dashboard
# ---------------------------------------------------------
records = df_display.to_dict(orient="records")
with open(OUTPUT_JSON, "w", encoding="utf8") as f:
    json.dump(records, f, indent=2)

print("SUCCESS — dashboard_data.json written.")
print("Reorganized + display subsets updated.")

