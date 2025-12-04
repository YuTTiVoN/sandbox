# csv_to_json.py
import pandas as pd
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
CSV_IN = DATA / "display_subset_v2.csv"
JSON_OUT = DATA / "display_subset_v2.json"

print("Reading:", CSV_IN)
df = pd.read_csv(CSV_IN, dtype=str).fillna("")   # treat everything as text, fill empties

# Optional: you can sort by fixedsort column if you also exported it; keeping CSV order as-is.
records = df.to_dict(orient="records")

print("Writing:", JSON_OUT)
with open(JSON_OUT, "w", encoding="utf8") as f:
    json.dump(records, f, indent=2, ensure_ascii=False)

print("Done. JSON rows:", len(records))
