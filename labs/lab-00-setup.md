# Lab 00 — Environment setup

> **Time:** ~20 min, mostly downloads · **Prerequisite:** none

Build the toolchain before you need it. Bioinformatics installation problems are their own
special misery and you do not want them standing between you and a concept.

**Everything in this lab was executed on macOS 26.5 / Apple Silicon (arm64) during writing.**
The versions and timings quoted are real, from this machine.

## What you'll have at the end

- Command-line tools: `samtools`, `bcftools`, `bwa`, `minimap2`, `seqkit`, `bedtools`
- A Python environment with numpy, pandas, scipy, matplotlib, biopython, pysam
- A verification script that confirms every tool actually launches
- Real *E. coli* sequencing data to work on

---

## 1. The Apple Silicon situation — good news

Most genomics setup guides tell you to install conda or mamba and pull tools from bioconda. On
Apple Silicon that advice has historically been painful: a large share of bioconda packages
have no `osx-arm64` build, so you end up forcing `CONDA_SUBDIR=osx-64` and running everything
under Rosetta translation.

**You do not need to do that.** Homebrew now ships native arm64 bottles for essentially the
whole core toolchain, and `uv` handles Python far faster than conda. This lab uses those, with
Docker as the fallback for the two or three tools neither covers.

| Need | Tool used here | Why |
|---|---|---|
| CLI bioinformatics tools | **Homebrew** | Native arm64 bottles, precompiled, no Rosetta |
| Python packages | **uv** | Resolves and installs in seconds; handles interpreter pinning |
| The few tools in neither | **Docker** | `plink2`, `iqtree2`, `sra-tools` |

If you are on Linux, `brew` works there too, or use your distribution's package manager; the
rest of the labs are unchanged.

## 2. Install the command-line tools

```bash
brew install samtools bcftools bwa minimap2 seqkit bedtools
```

Later labs add a few more:

```bash
brew install fastqc mafft spades flye salmon kallisto blast
```

Confirm they are native rather than translated — `file` should say `arm64`, not `x86_64`:

```bash
file "$(command -v samtools)"
```

Versions installed at the time of writing: samtools 1.24, bcftools 1.24, bwa 0.7.19,
minimap2 2.31, seqkit 2.13.0, bedtools 2.31.1.

> **A note on `--version`.** `samtools`, `bcftools`, `minimap2` and `bedtools` accept it.
> `bwa` and `seqkit` do not — they print usage instead, which looks like a failure and isn't.
> This is a small thing, but "the tool errored" versus "the tool has a different CLI convention"
> is a distinction worth internalising early.

## 3. Build the Python environment

Do **not** install packages into your system Python. Use a project virtual environment.

```bash
export GENOMICS=/path/to/learn-genomics   # the directory holding README.md
cd "$GENOMICS"
uv venv --python 3.12 .venv
source .venv/bin/activate
uv pip install numpy pandas matplotlib scipy biopython pysam statsmodels scikit-learn
```

Every later lab opens by returning to `$GENOMICS`. Put the `export` line in your shell
profile, or re-run it whenever you open a new terminal — the labs tell you when.

**Why pin 3.12 rather than take the newest interpreter?** Because compiled scientific packages
need wheels built for each Python version, and the newest release routinely has gaps for
months. This machine's default is Python 3.14, for which several of these packages had no
wheel; pinning to 3.12 resolved instantly. This is the single most common Python-environment
failure in scientific computing, and the fix is always the same: use an interpreter one or two
releases behind the bleeding edge.

Installed here: numpy 2.5.2, pandas 3.0.5, scipy 1.18.0, matplotlib 3.11.1, biopython 1.88,
pysam 0.24.0.

## 4. Verify — do not assume

Save as `labs/verify_setup.sh` and run it. A tool that installs is not the same as a tool that
launches.

```bash
#!/usr/bin/env bash
# Confirms every tool actually runs. Exits non-zero if anything is missing.
fail=0

echo "== command-line tools =="
for t in samtools bcftools bwa minimap2 seqkit bedtools; do
  if command -v "$t" >/dev/null 2>&1; then
    arch=$(file -b "$(command -v "$t")" | grep -o 'arm64\|x86_64' | head -1)
    printf "  ok    %-10s %s\n" "$t" "${arch:-script}"
  else
    printf "  MISS  %-10s\n" "$t"; fail=1
  fi
done

echo "== python =="
python - <<'PY' || fail=1
import importlib, platform, sys
print(f"  python {platform.python_version()} ({platform.machine()})")
missing = []
for m in ["numpy", "pandas", "scipy", "matplotlib", "Bio", "pysam", "statsmodels", "sklearn"]:
    try:
        mod = importlib.import_module(m)
        print(f"  ok    {m:12s} {getattr(mod, '__version__', '?')}")
    except ImportError:
        print(f"  MISS  {m}"); missing.append(m)
sys.exit(1 if missing else 0)
PY

[ $fail -eq 0 ] && echo "All good." || { echo "Setup incomplete."; exit 1; }
```

```bash
chmod +x labs/verify_setup.sh && ./labs/verify_setup.sh
```

## 5. Get the data

Every later lab uses the same two inputs. Download them once.

The reads are from the **Lenski long-term evolution experiment** — real *E. coli* that has been
propagated in the lab since 1988, sequenced on Illumina. Real data, real errors, real evolved
mutations.

```bash
mkdir -p labs/data && cd labs/data

# Reference genome: E. coli B str. REL606, the LTEE ancestor (4,629,812 bp)
curl -sL -o rel606.fa.gz \
  "https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/017/985/GCF_000017985.1_ASM1798v1/GCF_000017985.1_ASM1798v1_genomic.fna.gz"
gunzip -f rel606.fa.gz
```

The full read file is 183 MB per mate, which is more than a lab needs. **Stream the first
100,000 reads instead** — this takes seconds rather than minutes:

```bash
for m in 1 2; do
  curl -sL "https://ftp.sra.ebi.ac.uk/vol1/fastq/SRR258/003/SRR2584863/SRR2584863_${m}.fastq.gz" \
    | gunzip -c 2>/dev/null | head -n 400000 | gzip > ecoli_R${m}.fastq.gz
done
```

The pipe is doing real work here: `curl` streams compressed bytes, `gunzip` decompresses on the
fly, `head` takes the first 400,000 lines (= 100,000 four-line FASTQ records), and then `curl`
receives SIGPIPE and stops downloading. You never store the 183 MB. This pattern — subset at
the source rather than downloading and then subsetting — is worth keeping.

Confirm:

```bash
seqkit stats ecoli_R1.fastq.gz ecoli_R2.fastq.gz
```

Expected:

```
file               format  type  num_seqs     sum_len  min_len  avg_len  max_len
ecoli_R1.fastq.gz  FASTQ   DNA    100,000  15,000,000      150      150      150
ecoli_R2.fastq.gz  FASTQ   DNA    100,000  15,000,000      150      150      150
```

100,000 paired 150 bp reads = 30 Mbp of sequence against a 4.63 Mbp genome, so roughly **6×
coverage**. Low by modern standards, deliberately — it keeps every lab fast, and it makes the
consequences of low depth visible rather than theoretical.

> **Note on `sra-tools`.** Most tutorials tell you to install the SRA toolkit and run
> `fasterq-dump`. You don't need it. ENA mirrors SRA submissions as plain gzipped FASTQ over
> HTTPS, which is faster, streamable, and has no toolkit to install. Reach for `sra-tools` only
> when you need something ENA doesn't mirror.

## 6. Tools not in Homebrew

`plink2`, `iqtree2` and `sra-tools` aren't Homebrew formulae. Labs 07–10 need them; install
when you get there rather than now.

**Docker** (works for anything):

```bash
docker run --rm -v "$PWD:/data" -w /data quay.io/biocontainers/plink2:2.00a5.10--h4ac6f70_0 plink2 --version
```

On Apple Silicon many biocontainer images are `linux/amd64` only, so Docker will emulate. It
works and it is slower; add `--platform linux/amd64` to silence the warning.

**Direct binaries** (faster, and both publish native arm64 macOS builds):
[PLINK 2](https://www.cog-genomics.org/plink/2.0/) and
[IQ-TREE 2](http://www.iqtree.org/). Download, unzip, and put the binary on your `PATH`.

## 7. Housekeeping

`labs/data/` is in `.gitignore` — sequencing data does not belong in version control, and the
indices you are about to build are regenerable in under a second. If you need space back:

```bash
rm -rf labs/data
```

and re-run section 5.

---

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `brew: command not found` | Install Homebrew from [brew.sh](https://brew.sh), then reopen your shell |
| `uv pip install` fails building a wheel | Your Python is too new. Recreate with `uv venv --python 3.12 .venv` |
| Tool installs but `--version` prints usage | Not an error. `bwa` and `seqkit` don't accept `--version` |
| `curl` download produces an empty file | Check the URL resolves; ENA paths embed the accession in a specific directory structure |
| Docker image runs very slowly | It is `linux/amd64` under emulation. Prefer a native binary where one exists |
| `command not found` after installing | `/opt/homebrew/bin` is not on your `PATH`. Add it in `~/.zshrc` |

## Check yourself

**1. Why pin Python to 3.12 when 3.14 is available?**

<details><summary>Answer</summary>

Compiled scientific packages ship binary wheels built per Python version, and the newest
interpreter release routinely has gaps for months after release. Installing against it forces
a source build, which needs a compiler toolchain and frequently fails. One or two releases
behind is the pragmatic choice — and this was not hypothetical here: Python 3.14 was the system
default on this machine and lacked wheels for several of the required packages.

</details>

**2. What does the `curl | gunzip | head | gzip` pipeline accomplish that downloading and then subsetting would not?**

<details><summary>Answer</summary>

It never stores the full 183 MB file. `head` closes its input once it has 400,000 lines, `gunzip`
and then `curl` receive SIGPIPE, and the download terminates early. You transfer a few megabytes
instead of 183 and use no scratch space. Subsetting at the source rather than at the destination
is generally the right instinct with genomic data, where files routinely exceed available disk.

</details>

**3. You have 100,000 paired 150 bp reads and a 4.63 Mbp genome. What coverage does that give, and why was such a low number chosen?**

<details><summary>Answer</summary>

(100,000 × 2 × 150) ÷ 4,629,812 = 30,000,000 ÷ 4,629,812 ≈ **6.5×** nominal, and about 6.0×
actual after unmapped reads are excluded.

Chosen deliberately so every lab runs in seconds, and so that the consequences of low depth —
missed variants, low-confidence genotypes, the QUAL and DP filters mattering — are something
you observe rather than read about.

</details>
