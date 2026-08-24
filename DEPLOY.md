# Publishing the reader to GitHub Pages

The site is **built from the markdown on every push** and never committed. The chapters stay the
single source of truth, and the published pages cannot drift from the prose they were made from.

## What gets published

Only `reader-prototype/dist/` — the 117 generated pages and their assets. Everything else in the
repository (the markdown, the plans, the lab data) is visible on GitHub but is not part of the
website.

## It is live

<https://shnksi.github.io/learn-genomics/>

Repository: <https://github.com/shnksi/learn-genomics> (public — required for Pages on a free
account). Pages source is set to **GitHub Actions**; nothing is served from the branch itself.

### A note on the first deploy

The initial push published nothing, and it is worth knowing why. The workflow originally carried
a `paths:` filter, and **path filters do not match when a branch is created** — there is no prior
commit to diff against. The run had to be dispatched by hand.

The filter has since been removed. Every push to `main` now rebuilds, which is both simpler and
safer: a filter gap would fail the same silent way, leaving the published site quietly stale
against the prose. A full build takes about twenty seconds.

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
