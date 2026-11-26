"""Build and validate all 74 bespoke SVG figures for learn-genomics."""
from __future__ import annotations
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / "figures"

sys.path.insert(0, str(HERE))

import figs_part0_to_2
import figs_part3_to_5
import figs_part6_to_8
import figs_part9_to_10
import figs_part11_12_D_S
import figs_wave2_part0_to_3
import figs_wave2_part4_to_D
import figs_wave3_part1_to_7
import figs_wave3_part9_to_D
import figs_wave4_contrasts


def validate_svg(path: Path) -> list[str]:
    issues: list[str] = []
    raw = path.read_text(encoding="utf-8")
    try:
        root = ET.fromstring(raw)
    except ET.ParseError as e:
        return [f"XML parse error: {e}"]

    vb = root.attrib.get("viewBox", "")
    parts = [float(x) for x in vb.split()]
    if len(parts) != 4:
        issues.append(f"Invalid viewBox: {vb!r}")
        return issues
    _, _, w, h = parts

    for el in root.iter():
        tag = el.tag.split("}")[-1]
        if tag == "text":
            txt = el.text or ""
            if "\n" in txt:
                issues.append(f"Literal newline inside <text>: {txt!r}")
            for attr, limit in (("x", w), ("y", h)):
                val = el.attrib.get(attr)
                if val is not None:
                    try:
                        fv = float(val)
                        if fv < -5 or fv > limit + 10:
                            issues.append(f"<text {attr}={fv}> out of bounds [0, {limit}]: {txt[:30]!r}")
                    except ValueError:
                        pass
    return issues


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    modules = [
        ("Part 0–2", figs_part0_to_2),
        ("Part 3–5", figs_part3_to_5),
        ("Part 6–8", figs_part6_to_8),
        ("Part 9–10", figs_part9_to_10),
        ("Part 11–12, D, S", figs_part11_12_D_S),
        ("Wave 2 Parts 0–3", figs_wave2_part0_to_3),
        ("Wave 2 Parts 4–10 & D", figs_wave2_part4_to_D),
        ("Wave 3 Parts 1–7", figs_wave3_part1_to_7),
        ("Wave 3 Parts 9–12 & D", figs_wave3_part9_to_D),
        ("Wave 4 Contrasts", figs_wave4_contrasts),
    ]
    total = 0
    for label, mod in modules:
        mod.build_all(OUT)
        print(f"Built {label}")

    svgs = sorted(OUT.glob("fig-*.svg"))
    pngs = sorted(OUT.glob("art-*.png"))
    total = len(svgs)
    bad = 0
    for p in svgs:
        issues = validate_svg(p)
        if issues:
            bad += 1
            print(f"ISSUE in {p.name}:")
            for iss in issues:
                print(f"  - {iss}")

    print(f"\nGenerated {total} SVGs + {len(pngs)} hero PNGs = {total + len(pngs)} total figures in {OUT}")
    if bad:
        print(f"FAILED: {bad} SVGs have validation issues.")
        return 1
    print("ALL SVGs PASSED XML + bounds + multiline validation.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
