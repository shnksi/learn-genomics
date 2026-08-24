#!/usr/bin/env bash
# Confirms every tool the labs need actually runs. Exits non-zero if anything is missing.
# Usage: ./labs/verify_setup.sh
fail=0

echo "== command-line tools =="
for t in samtools bcftools bwa minimap2 seqkit bedtools; do
  if command -v "$t" >/dev/null 2>&1; then
    arch=$(file -b "$(command -v "$t")" | grep -o 'arm64\|x86_64' | head -1)
    printf "  ok    %-10s %s\n" "$t" "${arch:-script}"
  else
    printf "  MISS  %-10s (brew install %s)\n" "$t" "$t"; fail=1
  fi
done

echo "== optional (needed from lab 05 onward) =="
for t in fastqc mafft spades.py flye salmon kallisto; do
  if command -v "$t" >/dev/null 2>&1; then
    printf "  ok    %-10s\n" "$t"
  else
    printf "  --    %-10s not yet installed\n" "$t"
  fi
done

echo "== python =="
if ! command -v python >/dev/null 2>&1; then
  echo "  MISS  python — did you 'source .venv/bin/activate'?"; fail=1
else
  python - <<'PY' || fail=1
import importlib, platform, sys
print(f"  ok    python {platform.python_version()} ({platform.machine()})")
missing = []
for m in ["numpy", "pandas", "scipy", "matplotlib", "Bio", "pysam"]:
    try:
        mod = importlib.import_module(m)
        print(f"  ok    {m:12s} {getattr(mod, '__version__', '?')}")
    except ImportError:
        print(f"  MISS  {m:12s}"); missing.append(m)
if missing:
    print("        uv pip install " + " ".join(
        {"Bio": "biopython"}.get(m, m) for m in missing))
sys.exit(1 if missing else 0)
PY
fi

echo "== data =="
for f in labs/data/rel606.fa labs/data/ecoli_R1.fastq.gz labs/data/ecoli_R2.fastq.gz; do
  if [ -f "$f" ]; then
    printf "  ok    %-32s %s\n" "$(basename "$f")" "$(du -h "$f" | cut -f1)"
  else
    printf "  --    %-32s not downloaded (see lab-00 section 5)\n" "$(basename "$f")"
  fi
done

echo
if [ $fail -eq 0 ]; then
  echo "All required tools present."
else
  echo "Setup incomplete — see MISS lines above."
  exit 1
fi
