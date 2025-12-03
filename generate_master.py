import pandas as pd
from pathlib import Path

# -----------------------------
# File paths
# -----------------------------
ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"

RAW_DATA_FILE = DATA / "rust_raw_data_v3.xlsx"
STREAMER_DATA_FILE = DATA / "streamerdata.xlsx"

MASTER_OUTPUT = DATA / "reorganized_master_v2.csv"
DISPLAY_OUTPUT = DATA / "display_subset_v2.csv"

# -----------------------------
# Column Normalization
# -----------------------------
def normalize_columns(df):
    """
    Normalize dataframe columns:
    - strip whitespace
    - lowercase
    - replace spaces with underscores
    """
    clean_map = {}
    for col in df.columns:
        new = col.strip().replace(" ", "_").lower()
        clean_map[col] = new
    df.rename(columns=clean_map, inplace=True)
    return df

print("Loading input files...")

raw_df = pd.read_excel(RAW_DATA_FILE)
stream_df = pd.read_excel(STREAMER_DATA_FILE)

# Normalize FIRST
raw_df = normalize_columns(raw_df)
stream_df = normalize_columns(stream_df)

# -----------------------------
# Validate needed columns
# -----------------------------
required_cols = [
    "fixedsort", "date", "location", "biome",
    "event_category", "event_subtype1", "event_subtype2", "event_subtype3",
    "summary", "primary_streamer", "involved_streamers"
]

missing = [c for c in required_cols if c not in raw_df.columns]
if missing:
    raise ValueError(f"❌ Your rust_raw_data_v3.xlsx is missing columns: {missing}")

required_stream_cols = ["roleplay_name", "streamer_name", "socials"]
missing_s = [c for c in required_stream_cols if c not in stream_df.columns]
if missing_s:
    raise ValueError(f"❌ Your streamerdata.xlsx is missing columns: {missing_s}")

# -----------------------------
# Build social lookup
# (roleplay_name → socials)
# -----------------------------
stream_df["socials"] = stream_df["socials"].fillna("")

social_lookup = dict(zip(
    stream_df["roleplay_name"].astype(str).str.strip(),
    stream_df["socials"].astype(str).str.strip()
))

# -----------------------------
# Build "involved_streamers_url"
# -----------------------------
def convert_involved(names):
    if pd.isna(names) or not str(names).strip():
        return ""

    parts = [p.strip() for p in str(names).split(",") if p.strip()]
    urls = []

    for name in parts:
        lookup = social_lookup.get(name, "")
        urls.append(lookup if lookup else "??")

    # Convert NaN → ""
    urls = [u if isinstance(u, str) else "" for u in urls]
    return ", ".join(urls)

df = raw_df.copy()
df["involved_streamers_url"] = df["involved_streamers"].apply(convert_involved)

# -----------------------------
# Build Activity
# -----------------------------
df["activity"] = (
    df["event_subtype1"].fillna("") + ", " +
    df["event_subtype2"].fillna("") + ", " +
    df["event_subtype3"].fillna("")
).str.strip(", ").str.replace(", ,", "", regex=False)

# -----------------------------
# Combined Location
# -----------------------------
df["location_combined"] = (
    df["location"].fillna("") + " - " + df["biome"].fillna("")
).str.strip(" - ")

# -----------------------------
# Output: Master CSV
# -----------------------------
master_cols = [
    "date", "event_category", "activity",
    "primary_streamer", "involved_streamers",
    "location_combined", "summary", "involved_streamers_url",
    "fixedsort"
]

master_df = df[master_cols]
master_df.to_csv(MASTER_OUTPUT, index=False)
print(f"✔ Saved: {MASTER_OUTPUT.name}")

# -----------------------------
# Output: Display CSV
# -----------------------------
display_cols = [
    "date", "event_category", "activity",
    "primary_streamer", "involved_streamers",
    "location_combined", "summary"
]

display_df = df[display_cols]
display_df.to_csv(DISPLAY_OUTPUT, index=False)
print(f"✔ Saved: {DISPLAY_OUTPUT.name}")

print("\n🎉 All files generated successfully!")
