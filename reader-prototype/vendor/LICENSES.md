# Third-party licences

Two libraries are vendored into this repository so the site builds and runs without a network
and without a CDN — the published pages load nothing from an external host. Both are
redistributed here under their own licences, reproduced in full alongside this file.

| Library | Version | Licence | Text |
|---|---|---|---|
| [KaTeX](https://katex.org) | 0.16.11 | MIT | [`katex/LICENSE`](katex/LICENSE) |
| [Mermaid](https://mermaid.js.org) | 11.x | MIT | [`mermaid.LICENSE`](mermaid.LICENSE) |

`mermaid.min.js` is a bundle and carries dependencies compiled into it. The one with a
distinct licence is **DOMPurify** (Apache-2.0 OR MPL-2.0), reproduced in
[`dompurify.LICENSE`](dompurify.LICENSE). The bundle's own header retains the copyright and
licence notices of its smaller MIT-licensed components (the Bezier and Runge-Kutta helpers
adapted from Framer.js, among others); those notices are preserved and must not be stripped
when the file is copied into `dist/assets/`.

The vendored KaTeX CSS was modified in one respect: `url()` references to `.woff` and `.ttf`
fallbacks were removed, because only the 20 `.woff2` faces are vendored. No code was changed.

Everything else in this repository — the curriculum and the reader — is the author's own work.
