"""Publish the reviewed canonical JSON without recreating discarded duplicates."""
import json
from pathlib import Path
from audit_quotes import audit
root=Path(__file__).resolve().parents[1]
master=root/'data/quotes.master.json'
target=root/'dist/quotes.json' if (root/'dist').is_dir() else root/'quotes.json'
if master.exists():target.write_bytes(master.read_bytes())
rows=json.loads(target.read_text())
result=audit(rows)
if not result['passed']:raise SystemExit(result['errors'])
print(f"Validated {len(rows):,} reviewed records")
