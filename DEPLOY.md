# Publishing the reader to GitHub Pages

The site is **built from the markdown on every push** and never committed. The chapters stay the
single source of truth, and the published pages cannot drift from the prose they were made from.

## What gets published

Only `reader-prototype/dist/` — the 117 generated pages and their assets. Everything else in the
repository (the markdown, the plans, the lab data) is visible on GitHub but is not part of the
website.

## One-time setup

**1. Create the repository.** On a free GitHub account, Pages requires the repository to be
**public** — see [What becomes public](#what-becomes-public) before you do this. Private
repositories can serve Pages on Pro, Team and Enterprise.

**2. Initialise and push.**

```bash
cd /path/to/learn-genomics
git init -b main
git add .
git commit -m "Genetics & Genomics: course and reader"
git remote add origin git@github.com:USERNAME/REPO.git
git push -u origin main
```

**3. Turn Pages on.** In the repository: **Settings → Pages → Build and deployment → Source →
GitHub Actions**. Do not pick "Deploy from a branch" — this repository builds with Actions and
publishes nothing from the branch itself.

**4. Wait for the first run.** The **Actions** tab shows *Deploy course reader*. It builds, runs
its checks, and deploys. The URL appears on the Pages settings page and on the deployment itself:

```
https://USERNAME.github.io/REPO/
```

## After that

Push a chapter edit and the site rebuilds. Nothing else to do.

```bash
git add part-05-population-genetics/26-hardy-weinberg.md
git commit -m "Ch 26: clarify the exact test"
git push
```

The workflow also runs from **Actions → Deploy course reader → Run workflow** if you want a
rebuild without a content change.

## The build refuses to publish a broken site

Before deploying, the workflow asserts:

| Check | Fails the deploy if |
|---|---|
| Page count | fewer than 100 pages built |
| Cross-references | any page contains an unresolved `.md` link |
| Markup | any stray `**` left in prose |
| Assets | `index.html`, `404.html`, `.nojekyll` or the stylesheet missing |

A renamed chapter that orphans links, or a renderer regression, stops at the build rather than
going live.

## What becomes public

`.gitignore` already excludes the things that must never ship:

| Excluded | Why |
|---|---|
| `.gstack/` | contains `terminal-internal-token`, a credential |
| `labs/data/*` | 1.5 GB of sequencing files — `lab-00` re-downloads them |
| `.venv/`, `node_modules/` | environments |
| `reader-prototype/dist/` | generated; Actions rebuilds it |

Four lab figures under `labs/data/` are re-included deliberately, because the lab pages embed
them. Verified with `git check-ignore`: the images are tracked, the `.bam` and `.fastq.gz` files
are not.

**Also excluded by default — your in-progress project work.** `game-design/`,
`game-prototypes/`, `genome-workshop/`, `genomic-investigator/` and `review-artifacts/` are
separate projects: strategy, adversarial reviews and implementation plans that were not written
for an audience. "Deploy the course" reasonably means the curriculum and its reader, so the
default is to leave them out. Nothing in the reader depends on them.

**To publish them too**, delete the last block of `.gitignore` before your first `git add .`.

**One judgement call left to you.** `REVIEW-STATE.md` and `REVIEW-BRIEF.md` stay included. They
are the course's own QA record and they name defects that are still open — most substantially
the statistics-track ordering problem in §A1. That is arguably a virtue in a curriculum that
advertises how it handles accuracy, but it is a catalogue of known faults, published alongside
the thing it criticises. Add them to `.gitignore` if you would rather it were not.

## Local preview

`file://` works for a quick look, but a server matches production more closely:

```bash
cd reader-prototype && python3 build.py && python3 -m http.server -d dist 8000
```

Then <http://localhost:8000>.

## Notes

- **Paths are relative throughout**, so the site works unchanged at a user site
  (`user.github.io`), a project site (`user.github.io/repo/`) and from `file://`. Verified by
  serving the output under a subdirectory.
- **`.nojekyll`** is written into the output. Without it Pages runs Jekyll over the site and drops
  anything whose name starts with an underscore.
- **Python 3.11** in CI. The build is stdlib-only and produces byte-identical output on 3.9
  through 3.14, so the pinned version is not load-bearing.
- **Custom domain:** set it under Settings → Pages. With Actions-based publishing the domain
  lives in the repository's Pages configuration, not in the artifact — so do **not** try to commit
  a `CNAME` file into `reader-prototype/dist/`, which is deleted and regenerated on every build.
  If the domain ever fails to stick, have `build.py` write `dist/CNAME` so it is present in each
  artifact.
