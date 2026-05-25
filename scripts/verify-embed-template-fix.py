#!/usr/bin/env python3
"""Quick check: Facebook embed branch closes its wrapper div in compiled theme JS."""
import sys
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / (
    "server/liveblog/themes/themes_assets/default/dist/default-0444b3fa5d.js"
)
BROKEN = '</template>\\r\\n    </div\\r\\n";else if("instagram"'
FIXED = '</template>\\r\\n    </div>\\r\\n";else if("instagram"'

def main():
    text = JS.read_text(encoding="utf-8", errors="replace")
    if BROKEN in text:
        print("FAIL: broken Facebook embed closing tag still in", JS)
        return 1
    if FIXED not in text:
        print("FAIL: expected fixed pattern not found in", JS)
        return 1
    print("OK: compiled default theme has valid Facebook embed closing tag")
    return 0

if __name__ == "__main__":
    sys.exit(main())
