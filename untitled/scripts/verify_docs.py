#!/usr/bin/env python3
"""
BACKTEST Documentation Verification Script
Enforces architectural consistency, documentation integrity, ADR formatting,
and feature matrix traceability.
"""

import sys
import os
from pathlib import Path

REQUIRED_DOCS = [
    "docs/QUALITY_GATES.md",
    "docs/specifications/PRODUCT_REQUIREMENTS.md",
    "docs/specifications/FEATURE_MATRIX.md",
    "docs/architecture/SYSTEM_ARCHITECTURE.md",
    "docs/architecture/TECHNOLOGY_DECISIONS.md",
    "docs/architecture/adr/README.md",
    "docs/architecture/adr/ADR-0001-clean-architecture.md",
    "docs/architecture/adr/ADR-0002-core-ui-separation.md",
    "docs/architecture/adr/ADR-0003-strategy-api.md",
    "docs/architecture/adr/ADR-0004-data-storage.md",
    "docs/architecture/adr/ADR-0005-deterministic-event-ordering.md",
    "docs/architecture/adr/ADR-0006-financial-precision.md",
    "docs/architecture/adr/ADR-0007-ipc-strategy.md",
    "docs/architecture/adr/ADR-0008-snapshot-architecture.md",
    "docs/testing/TESTING_STRATEGY.md",
    "docs/phases/PHASE_0_REPORT.md",
    "README.md",
    "CONTRIBUTING.md",
    "LICENSE",
]

def verify_files_exist(root_dir: Path) -> bool:
    all_ok = True
    print("[*] Checking existence of required architectural documents...")
    for doc in REQUIRED_DOCS:
        p = root_dir / doc
        if not p.is_file():
            print(f"  [FAIL] Missing required document: {doc}")
            all_ok = False
        else:
            size = p.stat().st_size
            if size == 0:
                print(f"  [FAIL] Document is empty: {doc}")
                all_ok = False
            else:
                print(f"  [PASS] Found {doc} ({size} bytes)")
    return all_ok

def verify_adr_content(root_dir: Path) -> bool:
    print("[*] Checking ADR contents and standards...")
    adr_dir = root_dir / "docs" / "architecture" / "adr"
    adr_files = list(adr_dir.glob("ADR-*.md"))
    if not adr_files:
        print("  [FAIL] No ADR files found.")
        return False
    
    all_ok = True
    for f in adr_files:
        content = f.read_text(encoding="utf-8")
        if "Status:" not in content:
            print(f"  [FAIL] {f.name} missing 'Status:' declaration")
            all_ok = False
        if "Decision" not in content and "Context" not in content:
            print(f"  [FAIL] {f.name} missing Decision/Context section")
            all_ok = False
    if all_ok:
        print(f"  [PASS] Verified {len(adr_files)} ADR files.")
    return all_ok

def verify_deterministic_ordering_contract(root_dir: Path) -> bool:
    print("[*] Verifying ADR-0005 deterministic ordering contract...")
    adr5 = root_dir / "docs" / "architecture" / "adr" / "ADR-0005-deterministic-event-ordering.md"
    if not adr5.exists():
        return False
    content = adr5.read_text(encoding="utf-8")
    required_keywords = [
        "SimulationTimestamp",
        "EventPriority",
        "DeterministicEventKey",
        "StableTieBreaker",
        "insertion",
        "Invariant",
    ]
    for kw in required_keywords:
        if kw.lower() not in content.lower():
            print(f"  [FAIL] ADR-0005 missing required contract keyword: '{kw}'")
            return False
    print("  [PASS] ADR-0005 satisfies deterministic ordering contract requirements.")
    return True

def main():
    root_dir = Path(__file__).resolve().parent.parent
    print(f"=== BACKTEST Documentation Verification Running in {root_dir} ===")
    
    ok1 = verify_files_exist(root_dir)
    ok2 = verify_adr_content(root_dir)
    ok3 = verify_deterministic_ordering_contract(root_dir)
    
    if ok1 and ok2 and ok3:
        print("\n[SUCCESS] All documentation verification gates PASSED.")
        sys.exit(0)
    else:
        print("\n[FAILED] Documentation verification encountered errors.")
        sys.exit(1)

if __name__ == "__main__":
    main()
