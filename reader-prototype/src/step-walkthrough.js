/* ── Interactive Step-by-Step Walkthroughs (learn-genomics) ──────────────────
   60fps Retina HTML5 Canvas animations paired with clickable right-hand step
   tiles, Prev/Next navigation, Play/Pause auto-advance, and light/dark support.
   Zero external dependencies.
   ─────────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  const C = {
    bg: "#ffffff",
    stage: "#f2f8fa",
    panel: "#f7fafa",
    rule: "#d1dddb",
    ink: "#142226",
    soft: "#44585c",
    faint: "#7a9095",
    teal: "#0f766e",
    tealDk: "#115e59",
    tealLt: "#5ebfb6",
    tealBg: "#e5f6f4",
    amber: "#b45309",
    amberLt: "#ea9e42",
    amberBg: "#fef3c7",
    blue: "#1d4ed8",
    blueBg: "#eff6ff",
    rose: "#be123c",
    roseBg: "#fff1f2",
    purple: "#6d28d9",
    purpleBg: "#f5f3ff",
    green: "#15803d",
    greenBg: "#f0fdf4",
  };

  const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
  const ease = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;

  function mixHex(h1, h2, t) {
    t = clamp(t);
    const p = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const [r1, g1, b1] = p(h1), [r2, g2, b2] = p(h2);
    return `rgb(${Math.round(lerp(r1, r2, t))},${Math.round(lerp(g1, g2, t))},${Math.round(lerp(b1, b2, t))})`;
  }

  function roundRect(ctx, x, y, w, h, r, fill, stroke, lw = 1.5) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  }

  function arrow(ctx, x1, y1, x2, y2, color, lw = 2.4, head = 8) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - head * Math.cos(ang - 0.45), y2 - head * Math.sin(ang - 0.45));
    ctx.lineTo(x2 - head * Math.cos(ang + 0.45), y2 - head * Math.sin(ang + 0.45));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function badge(ctx, cx, y, text, bg, stroke, color) {
    ctx.save();
    let sz = 11.2;
    ctx.font = `600 ${sz}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    while (ctx.measureText(text).width > 410 && sz > 8.8) {
      sz -= 0.4;
      ctx.font = `600 ${sz}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    }
    const w = Math.min(432, Math.max(ctx.measureText(text).width + 22, 230));
    roundRect(ctx, cx - w / 2, y - 14, w, 26, 7, bg, stroke, 1.4);
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, cx, y - 1, w - 14);
    ctx.restore();
  }

  function label(ctx, x, y, text, opts = {}) {
    ctx.save();
    const weight = opts.weight || "600";
    const size = opts.size || 11;
    const fam = opts.mono
      ? "ui-monospace, 'SFMono-Regular', Menlo, monospace"
      : "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.font = `${weight} ${size}px ${fam}`;
    ctx.fillStyle = opts.color || C.ink;
    ctx.textAlign = opts.align || "center";
    ctx.textBaseline = opts.base || "middle";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function dashedLine(ctx, x1, y1, x2, y2, color, lw = 1.6, dash = [4, 3]) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     10 GENOMICS / BIOLOGY INTERACTIVE WALKTHROUGHS
     ═══════════════════════════════════════════════════════════════════════════ */

  const SCENES = {};

  /* ── 1. Ch 01: Deriving the DNA Double Helix from Chemistry Alone ───────── */
  const HELIX_PAIRS = [
    ["A", "T", 2], ["G", "C", 3], ["C", "G", 3], ["T", "A", 2],
    ["A", "T", 2], ["G", "C", 3], ["T", "A", 2], ["C", "G", 3],
    ["G", "C", 3], ["A", "T", 2], ["C", "G", 3], ["T", "A", 2],
  ];
  const BASE_COL = { A: C.teal, T: C.rose, G: C.amber, C: C.blue };

  SCENES["helix-derivation"] = {
    title: "Deriving the DNA Double Helix from Chemistry Alone",
    subtitle: "Click any constraint tile to build the 3D B-form helix step by step",
    steps: [
      { title: "1. Charged backbone outside", desc: "Polar water hydrates phosphate (−); flat nonpolar bases tuck inward" },
      { title: "2. Flat bases stack (3.4 Å)", desc: "Face-to-face π-stacking excludes water — primary stability driver" },
      { title: "3. Second strand enters", desc: "Buried bases have unsatisfied H-bonds → complementary strand pairs" },
      { title: "4. Purine + Pyrimidine (~20 Å)", desc: "A=T (2H) & G≡C (3H) maintain a constant helix diameter" },
      { title: "5. Helix twists (10.5 bp/turn)", desc: "Backbone geometry forces 34.3° right-handed rotation per step" },
      { title: "6. Antiparallel polarity", desc: "5′→3′ strand pairs with 3′←5′ partner to align pairing geometry" },
      { title: "7. Major vs. Minor grooves", desc: "Offset backbones open wide major groove so TF α-helices read closed DNA" },
    ],
    draw(ctx, W, H, s, t) {
      // Smooth continuous parameters from floating step s in [0..6]
      const p1 = ease(clamp(s + 0.35, 0, 1));
      const p2 = ease(clamp(s - 0.15, 0, 1));
      const p3 = ease(clamp(s - 1.15, 0, 1));
      const p4 = ease(clamp(s - 2.15, 0, 1));
      const p5 = ease(clamp(s - 3.15, 0, 1));
      const p6 = ease(clamp(s - 4.15, 0, 1));
      const p7 = ease(clamp(s - 5.15, 0, 1));
      const cur = Math.round(s);

      roundRect(ctx, 0, 0, W, H, 10, "#eef8fa", C.rule, 1.2);
      const cx = W / 2, cy = H / 2 - 6;

      // Drifting water dipoles
      const waters = [[36, 46, 0.7], [W - 36, 52, 1.3], [32, 145, 2.1], [W - 34, 152, 0.4],
        [38, 240, 1.8], [W - 38, 246, 2.7], [36, 326, 0.9], [W - 36, 330, 1.6]];
      for (const [wx, wy, ph] of waters) {
        const px = wx + 5 * Math.sin(t * 1.2 + ph), py = wy + 4 * Math.cos(t * 1.0 + ph);
        ctx.fillStyle = "#c4e6f0"; ctx.strokeStyle = "#8fc6d8"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(px, py, 4.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(px - 4.5, py + 3.5, 2.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(px + 4.5, py + 3.5, 2.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      label(ctx, 14, 18, "Aqueous solvent (polar H₂O)", { size: 10, color: "#4b8898", align: "left" });

      const n = HELIX_PAIRS.length;
      const dy = lerp(24.5, 21.5, p2);
      const R = 76;
      const offset = (lerp(180, 132, p7) * Math.PI) / 180;
      const twist = ((360 / 10.5) * Math.PI / 180) * p5;
      const spin = p5 > 0.25 ? (t * 0.55 * p5) : 0;
      const cxShift = lerp(-24, 0, p3);

      const s1 = [], s2 = [];
      for (let i = 0; i < n; i++) {
        const u = i - (n - 1) / 2;
        const by = cy + u * dy;
        const a1 = Math.PI + u * twist + spin;
        const a2 = a1 + offset;
        const wig = (1 - p1) * 14 * Math.sin(i * 1.2 + t * 2);
        s1.push({ x: cx + cxShift + R * Math.cos(a1) + wig, y: by, z: R * Math.sin(a1), a: a1 });
        s2.push({ x: cx + cxShift + R * Math.cos(a2) + (1 - p3) * 140, y: by, z: R * Math.sin(a2), a: a2 });
      }

      const drawList = [];
      const addBackbone = (pts, colF, colB, vis, isS2) => {
        if (vis < 0.02) return;
        for (let i = 0; i < n - 1; i++) {
          for (let sub = 0; sub < 4; sub++) {
            const f0 = sub / 4, f1 = (sub + 1) / 4;
            let x0, y0, z0, x1, y1, z1;
            if (p5 > 0.05) {
              const am0 = lerp(pts[i].a, pts[i + 1].a, f0);
              const am1 = lerp(pts[i].a, pts[i + 1].a, f1);
              const edx = isS2 ? (1 - p3) * 140 : 0;
              x0 = cx + cxShift + R * Math.cos(am0) + edx; z0 = R * Math.sin(am0); y0 = lerp(pts[i].y, pts[i + 1].y, f0);
              x1 = cx + cxShift + R * Math.cos(am1) + edx; z1 = R * Math.sin(am1); y1 = lerp(pts[i].y, pts[i + 1].y, f1);
            } else {
              x0 = lerp(pts[i].x, pts[i + 1].x, f0); y0 = lerp(pts[i].y, pts[i + 1].y, f0); z0 = lerp(pts[i].z, pts[i + 1].z, f0);
              x1 = lerp(pts[i].x, pts[i + 1].x, f1); y1 = lerp(pts[i].y, pts[i + 1].y, f1); z1 = lerp(pts[i].z, pts[i + 1].z, f1);
            }
            const zm = (z0 + z1) / 2;
            const dep = clamp((zm / R + 1) / 2);
            const col = mixHex("#eef8fa", mixHex(colB, colF, dep), vis);
            const lw = lerp(4.8, 10.2, dep);
            drawList.push([zm, () => {
              ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = "round";
              ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
            }]);
          }
        }
      };
      addBackbone(s1, C.teal, "#84bcb7", 1, false);
      addBackbone(s2, C.amber, "#dbb082", p3, true);

      // Phosphate beads
      for (let i = 0; i < n; i++) {
        for (const [pts, cf, cb, vis] of [[s1, C.tealDk, "#84bcb7", 1], [s2, C.amber, "#dbb082", p3]]) {
          if (vis < 0.05) continue;
          const pt = pts[i], dep = clamp((pt.z / R + 1) / 2);
          const rad = lerp(5, 7.6, dep);
          const col = mixHex("#eef8fa", mixHex(cb, cf, dep), vis);
          drawList.push([pt.z + 4, () => {
            ctx.fillStyle = "#ffffff"; ctx.strokeStyle = col; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            if (cur <= 1) {
              ctx.beginPath(); ctx.moveTo(pt.x - rad * 0.45, pt.y); ctx.lineTo(pt.x + rad * 0.45, pt.y); ctx.stroke();
            }
          }]);
        }
      }

      // Base rungs
      for (let i = 0; i < n; i++) {
        const [b1, b2, nhb] = HELIX_PAIRS[i];
        const pA = s1[i], pB = s2[i];
        const zm = (pA.z + pB.z) / 2;
        const dep = clamp((zm / R + 1) / 2);
        const tilt = (1 - p2) * 0.42 * Math.sin(i * 1.7 + 0.4);
        const isPur1 = b1 === "A" || b1 === "G";
        const f1 = isPur1 ? 0.52 : 0.35;
        const f2 = isPur1 ? 0.35 : 0.52;
        const vx = p3 > 0.05 ? (pB.x - pA.x) : 128;
        const vy = p3 > 0.05 ? (pB.y - pA.y) : tilt * 44;
        const c1 = mixHex("#b7cbce", BASE_COL[b1], 0.45 + 0.55 * dep);
        const c2 = mixHex("#b7cbce", BASE_COL[b2], 0.45 + 0.55 * dep);
        const bh = lerp(5, 8.2, dep);

        drawList.push([zm - 2, () => {
          const t1x = pA.x + vx * (p3 > 0.05 ? f1 : 0.44);
          const t1y = pA.y + vy * (p3 > 0.05 ? f1 : 0.44);
          ctx.strokeStyle = c1; ctx.lineWidth = bh; ctx.lineCap = "butt";
          ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(t1x, t1y); ctx.stroke();
          if (p4 > 0.3 && p5 < 0.65 && Math.abs(pB.x - pA.x) > 75) {
            const mx = (pA.x + t1x) / 2, my = (pA.y + t1y) / 2;
            roundRect(ctx, mx - 10, my - 7.5, 20, 15, 4, "#fff", c1, 1.3);
            label(ctx, mx, my + 0.5, b1, { size: 9.5, color: c1, mono: true });
          }
          if (cur === 2 && p3 < 0.9) {
            const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 7 + i));
            ctx.fillStyle = mixHex("#eef8fa", C.rose, pulse * (1 - p3 * 0.7));
            ctx.beginPath(); ctx.arc(t1x + 7, t1y - 3.5, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(t1x + 7, t1y + 3.5, 2.5, 0, Math.PI * 2); ctx.fill();
          }
          if (p3 > 0.05) {
            const t2x = pB.x - vx * f2, t2y = pB.y - vy * f2;
            const c2v = mixHex("#eef8fa", c2, p3);
            ctx.strokeStyle = c2v; ctx.lineWidth = bh;
            ctx.beginPath(); ctx.moveTo(pB.x, pB.y); ctx.lineTo(t2x, t2y); ctx.stroke();
            if (p4 > 0.3 && p5 < 0.65 && Math.abs(pB.x - pA.x) > 75) {
              const mx = (pB.x + t2x) / 2, my = (pB.y + t2y) / 2;
              roundRect(ctx, mx - 10, my - 7.5, 20, 15, 4, "#fff", c2v, 1.3);
              label(ctx, mx, my + 0.5, b2, { size: 9.5, color: c2v, mono: true });
            }
            if (p4 > 0.05) {
              const offs = nhb === 2 ? [-3.5, 3.5] : [-4.5, 0, 4.5];
              for (const oy of offs) dashedLine(ctx, t1x, t1y + oy, t2x, t2y + oy, mixHex("#eef8fa", C.soft, p4), 1.3, [3, 2.5]);
            }
          }
        }]);
      }

      drawList.sort((a, b) => a[0] - b[0]);
      for (const [, fn] of drawList) fn();

      // Step overlays
      if (cur === 0) {
        badge(ctx, cx, H - 22, "Charged PO₄⁻ backbone faces polar water; bases tuck inward", "#fff", C.teal, C.tealDk);
      } else if (cur === 1) {
        const yA = s1[4].y, yB = s1[5].y, calX = cx + 82;
        ctx.strokeStyle = C.amber; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(calX, yA); ctx.lineTo(calX, yB);
        ctx.moveTo(calX - 5, yA); ctx.lineTo(calX + 5, yA);
        ctx.moveTo(calX - 5, yB); ctx.lineTo(calX + 5, yB); ctx.stroke();
        label(ctx, calX + 10, (yA + yB) / 2, "3.4 Å π-stack", { size: 10, color: C.amber, align: "left" });
        badge(ctx, cx, H - 22, "Face-to-face base stacking = #1 driver of helix stability", C.amberBg, C.amber, C.amber);
      } else if (cur === 2) {
        badge(ctx, cx, H - 22, "Unsatisfied buried H-bonds draw in a complementary 2nd strand", C.roseBg, C.rose, C.rose);
      } else if (cur === 3) {
        const xL = s1[0].x, xR = s2[0].x, yt = s1[0].y - 20;
        ctx.strokeStyle = C.tealDk; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(xL, yt); ctx.lineTo(xR, yt);
        ctx.moveTo(xL, yt - 5); ctx.lineTo(xL, yt + 5); ctx.moveTo(xR, yt - 5); ctx.lineTo(xR, yt + 5); ctx.stroke();
        label(ctx, (xL + xR) / 2, yt - 11, "Constant ~20 Å width (Purine + Pyrimidine)", { size: 10, color: C.tealDk });
        badge(ctx, cx, H - 22, "A=T (2 H-bonds) & G≡C (3 H-bonds) lock uniform helix width", C.tealBg, C.teal, C.tealDk);
      } else if (cur === 4) {
        badge(ctx, cx, H - 22, "Right-handed 3D twist: 34.3° per step → ~10.5 bp/turn", C.tealBg, C.teal, C.tealDk);
      } else if (cur === 5) {
        arrow(ctx, 42, H - 64, 42, 62, C.teal, 3.2, 10);
        label(ctx, 42, 48, "3′", { size: 11, color: C.tealDk, mono: true });
        label(ctx, 42, H - 52, "5′", { size: 11, color: C.tealDk, mono: true });
        arrow(ctx, W - 42, 62, W - 42, H - 64, C.amber, 3.2, 10);
        label(ctx, W - 42, 48, "5′", { size: 11, color: C.amber, mono: true });
        label(ctx, W - 42, H - 52, "3′", { size: 11, color: C.amber, mono: true });
        badge(ctx, cx, H - 22, "Antiparallel strands: 5′→3′ paired with 3′←5′", C.purpleBg, C.purple, C.purple);
      } else {
        // Major vs Minor groove + docking TF alpha-helix
        ctx.strokeStyle = C.blue; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(30, 88); ctx.lineTo(30, 162);
        ctx.moveTo(24, 88); ctx.lineTo(36, 88); ctx.moveTo(24, 162); ctx.lineTo(36, 162); ctx.stroke();
        roundRect(ctx, 14, 112, 92, 24, 6, C.blueBg, C.blue, 1.3);
        label(ctx, 60, 124, "Major (~22 Å)", { size: 9.8, color: C.blue });

        ctx.strokeStyle = C.rose; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(30, 198); ctx.lineTo(30, 236);
        ctx.moveTo(24, 198); ctx.lineTo(36, 198); ctx.moveTo(24, 236); ctx.lineTo(36, 236); ctx.stroke();
        roundRect(ctx, 14, 205, 92, 24, 6, C.roseBg, C.rose, 1.3);
        label(ctx, 60, 217, "Minor (~12 Å)", { size: 9.8, color: C.rose });

        const dockX = lerp(W - 44, cx + 88, p7) + 3 * Math.sin(t * 2.5);
        roundRect(ctx, dockX - 42, 112, 84, 34, 15, C.purpleBg, C.purple, 1.8);
        label(ctx, dockX, 123, "TF α-helix", { size: 10, color: C.purple });
        label(ctx, dockX, 136, "reads groove", { size: 9, color: C.soft });
        arrow(ctx, dockX - 44, 129, cx + 18, 129, C.purple, 2, 7);
        badge(ctx, cx, H - 22, "Wide major groove lets proteins read sequence without unzipping", C.blueBg, C.blue, C.blue);
      }
    },
  };

  /* ── 2. Ch 04: Asymmetric DNA Replication Fork ──────────────────────────── */
  SCENES["replication-fork"] = {
    title: "How the DNA Replication Fork Handles 5′→3′ Only",
    subtitle: "Step through leading vs. lagging strand synthesis as helicase unwinds the duplex",
    steps: [
      { title: "1. Helicase unwinds duplex", desc: "Ring helicase unzips parental DNA moving rightward" },
      { title: "2. Primase lays 5′ RNA primers", desc: "DNA polymerases cannot start de novo — they need a free 3′-OH" },
      { title: "3. Leading strand extends continuously", desc: "Synthesised 5′→3′ smoothly right behind the advancing helicase" },
      { title: "4. Lagging strand Okazaki #1", desc: "Opposite template forces 5′→3′ synthesis AWAY from the fork" },
      { title: "5. New primer + Okazaki #2", desc: "Fresh single-stranded DNA behind fork gets primed & copied in chunks" },
      { title: "6. Primer removal & DNA Ligase", desc: "RNase H + Pol replace RNA with DNA; Ligase seals every nick" },
    ],
    draw(ctx, W, H, s, t) {
      roundRect(ctx, 0, 0, W, H, 10, C.stage, C.rule, 1.2);
      const cur = Math.round(s);
      const forkX = lerp(240, 315, ease(clamp(s / 4))) + 4 * Math.sin(t * 2);
      const cy = H / 2 - 12;

      // Parental duplex right of fork
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.moveTo(forkX, cy - 16); ctx.lineTo(W - 22, cy - 16); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(forkX, cy + 16); ctx.lineTo(W - 22, cy + 16); ctx.stroke();
      for (let x = forkX + 12; x < W - 26; x += 16) {
        ctx.strokeStyle = C.rule; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(x, cy - 14); ctx.lineTo(x, cy + 14); ctx.stroke();
      }
      label(ctx, W - 26, cy - 28, "5′", { size: 10, color: C.ink, mono: true });
      label(ctx, W - 26, cy + 30, "3′", { size: 10, color: C.ink, mono: true });

      // Opened upper & lower templates
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(forkX, cy - 16);
      ctx.bezierCurveTo(forkX - 36, cy - 16, forkX - 50, cy - 72, forkX - 88, cy - 72);
      ctx.lineTo(24, cy - 72); ctx.stroke();

      ctx.beginPath(); ctx.moveTo(forkX, cy + 16);
      ctx.bezierCurveTo(forkX - 36, cy + 16, forkX - 50, cy + 72, forkX - 88, cy + 72);
      ctx.lineTo(24, cy + 72); ctx.stroke();
      label(ctx, 24, cy - 84, "3′ template", { size: 9.5, color: C.soft, align: "left", mono: true });
      label(ctx, 24, cy + 86, "5′ template", { size: 9.5, color: C.soft, align: "left", mono: true });

      // Helicase wedge
      ctx.fillStyle = C.purpleBg; ctx.strokeStyle = C.purple; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(forkX - 24, cy); ctx.lineTo(forkX + 12, cy - 24); ctx.lineTo(forkX + 12, cy + 24); ctx.closePath();
      ctx.fill(); ctx.stroke();
      label(ctx, forkX - 2, cy, "Hel", { size: 9.5, color: C.purple });
      arrow(ctx, forkX + 18, cy, forkX + 46, cy, C.purple, 2, 7);

      // Step 2+: Leading RNA primer + Leading strand continuous extension
      const pLead = ease(clamp((s - 1.2) / 1.0));
      if (s >= 0.6) {
        const prVis = ease(clamp((s - 0.6) / 0.5));
        const sealed = ease(clamp((s - 4.4) / 0.6));
        // Primer at left of leading strand
        ctx.strokeStyle = mixHex(C.rose, C.teal, sealed); ctx.lineWidth = 4.2;
        ctx.beginPath(); ctx.moveTo(32, cy - 54); ctx.lineTo(32 + 24 * prVis, cy - 54); ctx.stroke();
        if (pLead > 0.05) {
          const leadEnd = lerp(56, forkX - 44, pLead);
          arrow(ctx, 56, cy - 54, leadEnd, cy - 54, C.teal, 3.6, 8);
          // Leading Pol circle
          ctx.fillStyle = C.tealBg; ctx.strokeStyle = C.teal; ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.arc(leadEnd + 8, cy - 54, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          label(ctx, leadEnd + 8, cy - 54, "Pol", { size: 8.5, color: C.tealDk });
          label(ctx, 135, cy - 96, "Leading strand (continuous 5′→3′)", { size: 10.5, color: C.tealDk });
        }
      }

      // Step 4+: Lagging strand Okazaki #1
      const pOk1 = ease(clamp((s - 2.3) / 0.8));
      const pOk2 = ease(clamp((s - 3.3) / 0.8));
      const pSeal = ease(clamp((s - 4.3) / 0.7));
      if (pOk1 > 0.02) {
        const r1 = 165, l1 = lerp(r1 - 18, 42, pOk1);
        ctx.strokeStyle = mixHex(C.rose, C.amber, pSeal); ctx.lineWidth = 4.2;
        ctx.beginPath(); ctx.moveTo(r1, cy + 54); ctx.lineTo(r1 - 18, cy + 54); ctx.stroke();
        arrow(ctx, r1 - 18, cy + 54, l1, cy + 54, C.amber, 3.6, 8);
        label(ctx, 102, cy + 36, "Okazaki #1 (5′→3′ ←)", { size: 9.5, color: C.amber });
      }
      if (pOk2 > 0.02) {
        const r2 = forkX - 46, l2 = lerp(r2 - 18, 174, pOk2);
        ctx.strokeStyle = mixHex(C.rose, C.amber, pSeal); ctx.lineWidth = 4.2;
        ctx.beginPath(); ctx.moveTo(r2, cy + 54); ctx.lineTo(r2 - 18, cy + 54); ctx.stroke();
        arrow(ctx, r2 - 18, cy + 54, l2, cy + 54, C.amber, 3.6, 8);
        label(ctx, (r2 + l2) / 2, cy + 36, "Okazaki #2", { size: 9.5, color: C.amber });
      }
      if (pSeal > 0.2) {
        roundRect(ctx, 144, cy + 44, 48, 20, 10, C.blueBg, C.blue, 1.5);
        label(ctx, 168, cy + 54, "Ligase", { size: 9, color: C.blue });
      }

      const msgs = [
        "Helicase splits the parental duplex into two single-stranded templates",
        "Primase lays short 5′ RNA primers (red) giving Pol a free 3′-OH",
        "Leading strand extends smoothly 5′→3′ straight into the opening fork",
        "Lagging strand must reverse direction: 5′→3′ AWAY from the fork",
        "As helicase opens more DNA, a second Okazaki fragment starts behind it",
        "RNase H removes primers, Pol fills gaps, Ligase seals all nicks cleanly!",
      ];
      badge(ctx, W / 2, H - 22, msgs[cur], C.bg, C.teal, C.tealDk);
    },
  };

  /* ── 3. Ch 06: Pre-mRNA Splicing Lariat Chemistry ───────────────────────── */
  SCENES["transcription-splicing"] = {
    title: "Pre-mRNA Splicing: Two Transesterifications & the Lariat",
    subtitle: "Step through how the spliceosome excises an intron at zero net chemical ATP cost",
    steps: [
      { title: "1. Splice signals recognised", desc: "U1 binds 5′ GU; U2 binds branch-point A; U2AF binds 3′ AG" },
      { title: "2. Intron folds into catalytic core", desc: "Spliceosome brings branch-point A's 2′-OH beside the 5′ GU bond" },
      { title: "3. Attack #1 → 2′–5′ lariat", desc: "Branch-point 2′-OH cleaves Exon 1, forming the circular intron lariat" },
      { title: "4. Attack #2 → Exon ligation", desc: "Free Exon 1 3′-OH attacks 3′ AG, joining Exon 1 directly to Exon 2" },
      { title: "5. Mature mRNA + excised lariat", desc: "Seamless coding junction exported; intron lariat debranched & recycled" },
    ],
    draw(ctx, W, H, s, t) {
      roundRect(ctx, 0, 0, W, H, 10, C.stage, C.rule, 1.2);
      const cur = Math.round(s);
      const fold = ease(clamp(s - 0.1, 0, 1));
      const cut1 = ease(clamp(s - 1.1, 0, 1));
      const cut2 = ease(clamp(s - 2.1, 0, 1));
      const done = ease(clamp(s - 3.1, 0, 1));

      const yBase = H / 2 + 24;
      const ex1X = lerp(34, 128, done);
      const ex2X = lerp(W - 118, 212, done);

      // Intron path (straight -> arched -> lariat loop -> floats up when excised!)
      const lariatLift = done * 64;
      const loopCx = W / 2, loopCy = yBase - 36 - fold * 48 - lariatLift;
      const loopR = lerp(8, 38, fold);

      if (fold < 0.1) {
        ctx.strokeStyle = C.soft; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(ex1X + 84, yBase); ctx.lineTo(ex2X, yBase); ctx.stroke();
      } else {
        // Intron loop
        ctx.strokeStyle = C.amber; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(loopCx, loopCy, loopR, 0, Math.PI * 2);
        ctx.stroke();
        // Left arm from Exon 1 to loop (breaks when cut1 > 0.5)
        if (cut1 < 0.7) {
          ctx.strokeStyle = mixHex(C.amber, C.stage, cut1); ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(ex1X + 84, yBase); ctx.lineTo(loopCx - loopR, loopCy + 6); ctx.stroke();
        }
        // Right tail from loop to Exon 2 (detaches when done > 0.3)
        ctx.strokeStyle = C.amber; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(loopCx + loopR, loopCy + 6);
        ctx.lineTo(done > 0.3 ? loopCx + loopR + 48 : ex2X, done > 0.3 ? loopCy + 6 : yBase);
        ctx.stroke();
      }

      // Branch-point A node
      const ax = fold < 0.1 ? W / 2 + 12 : loopCx - loopR;
      const ay = fold < 0.1 ? yBase : loopCy + 6;
      ctx.fillStyle = C.amberBg; ctx.strokeStyle = C.amber; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ax, ay, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      label(ctx, ax, ay, "A", { size: 10, color: C.amber, mono: true });
      if (cur <= 2) label(ctx, ax - 24, ay - 16, "2′-OH", { size: 9.5, color: C.amber, mono: true });

      // Nucleophilic attack arrows
      if (cur === 2) {
        arrow(ctx, ax, ay + 12, ex1X + 88, yBase - 6, C.rose, 2.4, 8);
        label(ctx, (ax + ex1X + 88) / 2 - 22, (ay + yBase) / 2, "Attack #1", { size: 9.5, color: C.rose });
      }
      if (cur === 3) {
        arrow(ctx, ex1X + 88, yBase + 16, ex2X - 4, yBase + 16, C.teal, 2.6, 8);
        label(ctx, W / 2, yBase + 32, "3′-OH attacks 3′ AG (Attack #2)", { size: 10, color: C.tealDk });
      }

      // Exon 1 & Exon 2 boxes
      roundRect(ctx, ex1X, yBase - 18, 84, 36, 6, C.tealBg, C.teal, 2);
      label(ctx, ex1X + 42, yBase, "Exon 1", { size: 11, color: C.tealDk });
      roundRect(ctx, ex2X, yBase - 18, 84, 36, 6, C.blueBg, C.blue, 2);
      label(ctx, ex2X + 42, yBase, "Exon 2", { size: 11, color: C.blue });

      if (cur === 0) {
        label(ctx, ex1X + 98, yBase - 16, "5′ GU", { size: 9.5, color: C.rose, mono: true });
        label(ctx, ex2X - 18, yBase - 16, "3′ AG", { size: 9.5, color: C.rose, mono: true });
      }
      if (done > 0.5) {
        label(ctx, loopCx, loopCy, "Lariat", { size: 10, color: C.amber });
        label(ctx, (ex1X + ex2X + 84) / 2, yBase + 32, "Mature ligated mRNA (Exon 1 – Exon 2)", { size: 10.5, color: C.tealDk });
      }

      const msgs = [
        "Short consensus signals (GU, branch A, AG) mark intron boundaries",
        "Spliceosome (snRNPs) folds intron so branch-point A nears 5′ GU",
        "Transesterification 1: 2′-OH cuts 5′ GU → 2′–5′ lariat + free Exon 1",
        "Transesterification 2: Exon 1's 3′-OH attacks 3′ AG to ligate exons",
        "Two bonds broken, two bonds formed → zero net chemical ATP cost!",
      ];
      badge(ctx, W / 2, H - 22, msgs[cur], C.bg, C.teal, C.tealDk);
    },
  };

  /* ── 4. Ch 07: Ribosome Translation Elongation & Frameshift ─────────────── */
  SCENES["translation-elongation"] = {
    title: "Ribosome Elongation (E, P, A Sites) & Reading-Frame Sensitivity",
    subtitle: "Watch tRNAs decode codons one triplet at a time — and see why a +1 insertion breaks everything",
    steps: [
      { title: "1. Peptidyl-tRNA in P site", desc: "Growing chain (Met–Pro–Gly) sits in the P site over codon UCC" },
      { title: "2. Aminoacyl-tRNA enters A site", desc: "Charged Val-tRNA base-pairs its anticodon with A-site codon GUG" },
      { title: "3. Peptide bond formation", desc: "Ribosome (rRNA ribozyme!) transfers chain onto A-site Val" },
      { title: "4. Translocation (+3 nt)", desc: "Ribosome shifts 1 codon rightward; empty tRNA exits E site" },
      { title: "5. +1 bp frameshift disaster", desc: "Inserting ONE base shifts every downstream triplet & amino acid!" },
    ],
    draw(ctx, W, H, s, t) {
      roundRect(ctx, 0, 0, W, H, 10, C.stage, C.rule, 1.2);
      const cur = Math.round(s);
      const pA = ease(clamp(s - 0.1, 0, 1));
      const pPep = ease(clamp(s - 1.1, 0, 1));
      const pShift = ease(clamp(s - 2.1, 0, 1));
      const pFrame = ease(clamp(s - 3.2, 0, 1));

      const cx = W / 2, cy = 152;
      // Ribosome large + small subunits
      ctx.fillStyle = "#ffffff"; ctx.strokeStyle = C.rule; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, cy - 10, 152, 74, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      roundRect(ctx, cx - 134, cy + 28, 268, 42, 18, "#edf4f2", C.rule, 1.6);

      // E, P, A slots
      const slots = [[cx - 98, "E", C.faint, "#fff"], [cx - 28, "P", C.teal, C.tealBg], [cx + 42, "A", C.blue, C.blueBg]];
      for (const [sx, nm, col, bg] of slots) {
        roundRect(ctx, sx, cy - 58, 56, 76, 8, bg, col, 1.5);
        label(ctx, sx + 28, cy - 44, nm + " site", { size: 9.5, color: col });
      }

      // mRNA strip (shifts left during translocation!)
      const shiftPx = pShift * 70;
      const my = cy + 36;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.moveTo(18, my); ctx.lineTo(W - 18, my); ctx.stroke();
      const codons = pFrame > 0.5
        ? ["AUG", "ACC", "GUC", "CGU", "UAG"]
        : ["AUG", "CCG", "UCC", "GUG", "UAA"];
      for (let i = 0; i < codons.length; i++) {
        const bx = cx - 168 + i * 70 - shiftPx;
        if (bx < 16 || bx > W - 70) continue;
        const bad = pFrame > 0.5 && i >= 1;
        roundRect(ctx, bx, my - 12, 56, 24, 4, bad ? C.roseBg : "#fff", bad ? C.rose : C.ink, 1.4);
        label(ctx, bx + 28, my, codons[i], { size: 10.5, color: bad ? C.rose : C.ink, mono: true });
      }

      // P-site tRNA (moves to E site on translocation)
      const t1x = lerp(cx, cx - 70, pShift);
      roundRect(ctx, t1x - 16, cy - 26, 32, 34, 6, C.tealBg, C.teal, 1.5);
      label(ctx, t1x, cy - 9, "tRNA", { size: 8.5, color: C.tealDk });

      // Incoming A-site tRNA (glides down in Step 2, moves to P in Step 4)
      if (pA > 0.02) {
        const t2x = lerp(cx + 70, cx, pShift);
        const t2y = lerp(cy - 92, cy - 26, pA);
        roundRect(ctx, t2x - 16, t2y, 32, 34, 6, C.blueBg, C.blue, 1.5);
        label(ctx, t2x, t2y + 17, "tRNA", { size: 8.5, color: C.blue });
        // Val amino acid
        ctx.fillStyle = C.roseBg; ctx.strokeStyle = C.rose; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(t2x, t2y - 12, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        label(ctx, t2x, t2y - 12, "Val", { size: 8, color: C.rose });
      }

      // Growing polypeptide chain (transfers from P to A on Step 3!)
      const chainAnchorX = lerp(t1x, lerp(cx + 70, cx, pShift), pPep);
      const aas = pFrame > 0.5 ? [["Met", C.amber], ["Thr", C.rose], ["Val", C.rose]] : [["Gly", C.teal], ["Pro", C.blue], ["Met", C.amber]];
      aas.forEach(([aa, col], idx) => {
        const ax = chainAnchorX - idx * 20;
        const ay = cy - 42 - pPep * 12 - idx * 10;
        ctx.fillStyle = "#fff"; ctx.strokeStyle = col; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(ax, ay, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        label(ctx, ax, ay, aa, { size: 8, color: col });
      });

      if (pFrame > 0.3) {
        roundRect(ctx, 28, H - 104, W - 56, 48, 8, C.roseBg, C.rose, 1.5);
        label(ctx, cx, H - 88, "+1 base inserted after AUG → every codon shifts!", { size: 10.5, color: C.rose });
        label(ctx, cx, H - 70, "Normal: Met–Pro–Ser–Val   vs.   +1 bp: Met–Thr–Val–Arg–STOP!", { size: 9.5, color: C.soft, mono: true });
      }

      const msgs = [
        "Peptidyl-tRNA holds the growing polypeptide chain in the P site",
        "Matching charged Val-tRNA docks into the A site via codon–anticodon fit",
        "28S rRNA catalyses peptide transfer — the ribosome is a ribozyme!",
        "EF-G ratchets ribosome exactly 3 nucleotides; empty tRNA exits E site",
        "Because codons are non-overlapping triplets, a +1 indel scrambles the rest",
      ];
      badge(ctx, cx, H - 22, msgs[cur], C.bg, cur === 4 ? C.rose : C.teal, cur === 4 ? C.rose : C.tealDk);
    },
  };

  /* ── 5. Ch 09: Meiosis & Prophase I Crossing Over ───────────────────────── */
  SCENES["meiosis-crossing-over"] = {
    title: "Meiosis & Crossing Over: From One Diploid Cell to Four Unique Gametes",
    subtitle: "Follow one homologous pair (A–B / a–b) through replication, chiasma exchange, MI, and MII",
    steps: [
      { title: "1. Diploid cell (2n)", desc: "One maternal (teal A–B) and one paternal (amber a–b) homologue" },
      { title: "2. S-phase replication", desc: "Each chromosome copies into two identical sister chromatids" },
      { title: "3. Prophase I crossover", desc: "Non-sister chromatids swap arms at a physical chiasma" },
      { title: "4. Meiosis I (reductional)", desc: "Homologous pairs separate → two haploid (1n) daughter cells" },
      { title: "5. Meiosis II → 4 gametes", desc: "Sisters separate → 2 parental (AB, ab) + 2 recombinant (Ab, aB)" },
    ],
    draw(ctx, W, H, s) {
      roundRect(ctx, 0, 0, W, H, 10, C.stage, C.rule, 1.2);
      const cur = Math.round(s);
      const rep = ease(clamp(s - 0.1, 0, 1));
      const xo = ease(clamp(s - 1.1, 0, 1));
      const mi = ease(clamp(s - 2.1, 0, 1));
      const mii = ease(clamp(s - 3.1, 0, 1));

      const cx = W / 2, cy = H / 2 - 14;
      const sep1 = mi * 95;
      const sep2 = mii * 46;

      // Cell outlines
      if (mi < 0.3) {
        ctx.fillStyle = "#fff"; ctx.strokeStyle = C.rule; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, cy, 140, 104, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      } else if (mii < 0.3) {
        for (const dx of [-sep1, sep1]) {
          ctx.fillStyle = "#fff"; ctx.strokeStyle = C.teal; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.ellipse(cx + dx, cy, 80, 92, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
      } else {
        for (const gx of [cx - 142, cx - 48, cx + 48, cx + 142]) {
          ctx.fillStyle = "#fff"; ctx.strokeStyle = C.teal; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.ellipse(gx, cy, 40, 82, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
      }

      // Draw 4 chromatids smoothly tracking from 2 -> 4 -> crossover -> 2 cells -> 4 gametes
      const drawChrom = (x, yTop, yBot, topCol, botCol, lTop, lBot) => {
        const yMid = (yTop + yBot) / 2;
        ctx.lineWidth = 6; ctx.lineCap = "round";
        ctx.strokeStyle = topCol; ctx.beginPath(); ctx.moveTo(x, yTop); ctx.lineTo(x, yMid); ctx.stroke();
        ctx.strokeStyle = botCol; ctx.beginPath(); ctx.moveTo(x, yMid); ctx.lineTo(x, yBot); ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, yTop + 26, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        label(ctx, x, yTop - 12, lTop, { size: 10, color: topCol, mono: true });
        label(ctx, x, yBot + 14, lBot, { size: 10, color: botCol, mono: true });
      };

      const yt = cy - 48, yb = cy + 48;
      // 4 chromatids: c1(maternal outer), c2(maternal inner -> rec), c3(paternal inner -> rec), c4(paternal outer)
      const x1 = cx - lerp(44, 58, rep) - sep1 + (mii ? (-142 - (-58 - 95)) * mii : 0);
      const x2 = cx - lerp(44, 24, rep) - sep1 + (mii ? (-48 - (-24 - 95)) * mii : 0);
      const x3 = cx + lerp(44, 24, rep) + sep1 + (mii ? (48 - (24 + 95)) * mii : 0);
      const x4 = cx + lerp(44, 58, rep) + sep1 + (mii ? (142 - (58 + 95)) * mii : 0);

      const rec = xo > 0.45;
      drawChrom(x1, yt, yb, C.teal, C.teal, "A", "B");
      if (rep > 0.15) drawChrom(x2, yt, yb, C.teal, rec ? C.amber : C.teal, "A", rec ? "b" : "B");
      if (rep > 0.15) drawChrom(x3, yt, yb, C.amber, rec ? C.teal : C.amber, "a", rec ? "B" : "b");
      drawChrom(x4, yt, yb, C.amber, C.amber, "a", "b");

      // Chiasma X flash in Step 3
      if (cur === 2) {
        ctx.strokeStyle = C.rose; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(x2, cy + 4); ctx.lineTo(x3, cy + 32);
        ctx.moveTo(x3, cy + 4); ctx.lineTo(x2, cy + 32); ctx.stroke();
        label(ctx, cx, cy + 68, "Chiasma (reciprocal non-sister exchange)", { size: 10, color: C.rose });
      }
      if (cur === 4) {
        label(ctx, cx - 142, cy + 72, "Parental", { size: 9, color: C.soft });
        label(ctx, cx - 48, cy + 72, "Recomb!", { size: 9, color: C.rose });
        label(ctx, cx + 48, cy + 72, "Recomb!", { size: 9, color: C.rose });
        label(ctx, cx + 142, cy + 72, "Parental", { size: 9, color: C.soft });
      }

      const msgs = [
        "Before S phase: 1 maternal (AB) and 1 paternal (ab) homologue (2n)",
        "S phase copies each chromosome into joined sister chromatids",
        "Prophase I: homologues synapse & exchange non-sister arms at chiasmata",
        "Meiosis I separates homologues (2n → 1n); centromeres stay intact",
        "Meiosis II splits sisters → max 50% recombinant gametes per crossover!",
      ];
      badge(ctx, cx, H - 22, msgs[cur], C.bg, C.teal, C.tealDk);
    },
  };

  /* ── 6. Ch 21: lac Operon Biological AND Gate ───────────────────────────── */
  SCENES["lac-operon-gate"] = {
    title: "The lac Operon as a Two-Input Biological AND Gate",
    subtitle: "Click each nutrient condition to watch LacI repressor & CAP–cAMP control RNA Polymerase",
    steps: [
      { title: "1. +Glucose, −Lactose → OFF", desc: "LacI blocks operator; low cAMP means no CAP activation" },
      { title: "2. +Glucose, +Lactose → Trickle", desc: "Allolactose removes LacI, but glucose suppresses cAMP/CAP" },
      { title: "3. −Glucose, −Lactose → OFF", desc: "CAP–cAMP binds promoter, but LacI still blocks RNA Pol" },
      { title: "4. −Glucose, +Lactose → HIGH ON", desc: "LacI released + CAP–cAMP recruits RNA Pol → full lacZYA burst!" },
    ],
    draw(ctx, W, H, s, t) {
      roundRect(ctx, 0, 0, W, H, 10, C.stage, C.rule, 1.2);
      const cur = Math.round(s);
      const hasLac = cur === 1 || cur === 3;
      const lowGlu = cur === 2 || cur === 3;
      const highOn = cur === 3;
      const trickle = cur === 1;

      // Top status pills
      roundRect(ctx, 26, 20, 146, 28, 14, lowGlu ? C.tealBg : C.amberBg, lowGlu ? C.teal : C.amber, 1.5);
      label(ctx, 99, 34, lowGlu ? "Glucose: ABSENT (↑cAMP)" : "Glucose: PRESENT (↓cAMP)", { size: 9.5, color: lowGlu ? C.tealDk : C.amber });
      roundRect(ctx, 186, 20, 146, 28, 14, hasLac ? C.blueBg : C.panel, hasLac ? C.blue : C.rule, 1.5);
      label(ctx, 259, 34, hasLac ? "Lactose: PRESENT" : "Lactose: ABSENT", { size: 9.5, color: hasLac ? C.blue : C.faint });
      roundRect(ctx, W - 118, 20, 96, 28, 14, highOn ? C.greenBg : (trickle ? C.amberBg : C.roseBg), highOn ? C.green : (trickle ? C.amber : C.rose), 1.6);
      label(ctx, W - 70, 34, highOn ? "OUTPUT: HIGH" : (trickle ? "OUTPUT: LOW" : "OUTPUT: OFF"), { size: 9.5, color: highOn ? C.green : (trickle ? C.amber : C.rose) });

      // DNA operon track
      const dy = 212;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(22, dy); ctx.lineTo(W - 22, dy); ctx.stroke();

      const segs = [[34, 62, "CAP site", C.blue, C.blueBg], [104, 66, "Promoter", C.teal, C.tealBg],
        [178, 62, "Operator", C.rose, C.roseBg], [250, 174, "lacZ · lacY · lacA", C.purple, C.purpleBg]];
      for (const [x, w, lbl, col, bg] of segs) {
        roundRect(ctx, x, dy - 16, w, 32, 5, bg, col, 1.6);
        label(ctx, x + w / 2, dy, lbl, { size: 9.5, color: col });
      }

      // CAP-cAMP activator
      const capY = lowGlu ? dy - 42 : 98;
      roundRect(ctx, 36, capY - 14, 60, 28, 12, lowGlu ? C.blueBg : "#fff", lowGlu ? C.blue : C.rule, 1.8);
      label(ctx, 66, capY, lowGlu ? "CAP·cAMP" : "CAP (free)", { size: 9, color: lowGlu ? C.blue : C.faint });

      // LacI repressor (bound on Operator when no lactose, floating away with allolactose when lactose present!)
      const lacY = hasLac ? 104 : dy - 42;
      const lacX = hasLac ? 218 : 209;
      roundRect(ctx, lacX - 30, lacY - 15, 60, 30, 8, hasLac ? C.panel : C.roseBg, hasLac ? C.soft : C.rose, 1.8);
      label(ctx, lacX, lacY, hasLac ? "LacI·allo" : "LacI LOCK", { size: 9, color: hasLac ? C.soft : C.rose });
      if (hasLac) {
        ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(lacX + 28, lacY - 10, 6, 0, Math.PI * 2); ctx.fill();
      }

      // RNA Polymerase (moves briskly across lacZYA when HIGH ON, crawls when trickle, blocked when OFF!)
      let polX = 136;
      if (highOn) polX = 136 + ((t * 95) % 245);
      else if (trickle) polX = 136 + ((t * 28) % 245);
      ctx.fillStyle = C.tealBg; ctx.strokeStyle = C.teal; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(polX, dy - 42, 28, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      label(ctx, polX, dy - 42, "RNA Pol", { size: 9, color: C.tealDk });

      // Flowing nascent mRNA waves when ON!
      if (highOn || trickle) {
        const count = highOn ? 4 : 1;
        for (let k = 0; k < count; k++) {
          const my = 266 + k * 14;
          ctx.strokeStyle = highOn ? C.teal : C.amber; ctx.lineWidth = 2.2;
          ctx.beginPath();
          for (let x = 252; x < 414; x += 6) {
            const yy = my + 3 * Math.sin(x * 0.12 - t * 6 + k);
            if (x === 252) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
          }
          ctx.stroke();
        }
        label(ctx, 134, 284, highOn ? "High lacZYA mRNA burst!" : "Weak trickle (no CAP)", { size: 10, color: highOn ? C.tealDk : C.amber });
      } else {
        label(ctx, W / 2, 280, "Operator blocked by LacI repressor — zero transcription", { size: 10.5, color: C.rose });
      }

      const msgs = [
        "No lactose → LacI sits tight on the operator; cell saves ATP",
        "Glucose preferred: even with lactose, low cAMP limits Pol recruitment",
        "Cell is hungry (CAP bound), but no lactose exists to digest → still OFF",
        "Both conditions met (NOT Glucose AND Lactose) → full operon activation!",
      ];
      badge(ctx, W / 2, H - 22, msgs[cur], C.bg, highOn ? C.green : C.teal, highOn ? C.green : C.tealDk);
    },
  };

  /* ── 7. Ch 38: CRISPR-Cas9 Programmable Editing ─────────────────────────── */
  SCENES["crispr-editing"] = {
    title: "CRISPR-Cas9 Mechanism: PAM Scan → R-Loop → Cleavage → Repair",
    subtitle: "Step through programmable DNA recognition and the NHEJ vs. HDR repair choice",
    steps: [
      { title: "1. Scan for 5′-NGG-3′ PAM", desc: "Cas9 ignores target DNA until it bumps into a 3-bp PAM motif" },
      { title: "2. R-loop spacer match", desc: "Duplex unzips locally; 20-nt sgRNA tests Watson–Crick complementarity" },
      { title: "3. Blunt DSB (3 bp upstream)", desc: "HNH & RuvC nuclease domains snap shut and cut both DNA strands" },
      { title: "4. Outcome A: NHEJ knockout", desc: "Fast end-joining introduces small random indels → frameshift LoF" },
      { title: "5. Outcome B: HDR / Base / Prime", desc: "Donor template (or nickase editor) installs exact base-pair edits" },
    ],
    draw(ctx, W, H, s, t) {
      roundRect(ctx, 0, 0, W, H, 10, C.stage, C.rule, 1.2);
      const cur = Math.round(s);
      const scan = ease(clamp(s, 0, 1));
      const open = ease(clamp(s - 0.1, 0, 1));
      const cut = ease(clamp(s - 1.2, 0, 1));
      const repair = ease(clamp(s - 2.2, 0, 1));

      const cy = 166;
      const casX = lerp(110, W / 2, scan);
      // Cas9 protein cloud
      ctx.fillStyle = C.tealBg; ctx.strokeStyle = C.teal; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(casX, cy, 118, 68, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      label(ctx, casX - 76, cy - 48, "Cas9", { size: 11, color: C.tealDk });

      // DNA strands
      const gap = cur === 2 ? 12 : 0;
      const drawStrand = (y, col) => {
        ctx.strokeStyle = col; ctx.lineWidth = 3.2;
        ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(W / 2 + 12 - gap, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(W / 2 + 12 + gap, y); ctx.lineTo(W - 20, y); ctx.stroke();
      };
      drawStrand(cy - 18 - open * 16, C.ink);
      drawStrand(cy + 18 + open * 16, C.ink);

      // PAM box on right
      roundRect(ctx, W / 2 + 44, cy - 28, 44, 20, 4, C.amberBg, C.amber, 1.6);
      label(ctx, W / 2 + 66, cy - 18, "NGG", { size: 10, color: C.amber, mono: true });

      // sgRNA hybridizing inside R-loop
      if (open > 0.1) {
        ctx.strokeStyle = C.purple; ctx.lineWidth = 3.2;
        ctx.beginPath(); ctx.moveTo(W / 2 - 74, cy + 16); ctx.lineTo(W / 2 + 38, cy + 16);
        ctx.quadraticCurveTo(W / 2 + 64, cy + 16, W / 2 + 68, cy - 48); ctx.stroke();
        label(ctx, W / 2 - 18, cy + 4, "20-nt sgRNA spacer", { size: 9.5, color: C.purple });
      }

      // Cut triangles at 3 bp upstream of PAM
      if (cur === 2) {
        label(ctx, W / 2 + 12, cy - 48, "▼ RuvC", { size: 9.5, color: C.rose });
        label(ctx, W / 2 + 12, cy + 52, "▲ HNH", { size: 9.5, color: C.rose });
      }

      // Repair outcome cards at bottom
      if (cur === 3) {
        roundRect(ctx, 48, 250, W - 96, 62, 8, C.roseBg, C.rose, 1.6);
        label(ctx, W / 2, 270, "NHEJ: fast ligation → ±1–10 bp random indels", { size: 10.5, color: C.rose });
        label(ctx, W / 2, 292, "ATG CCG [−2 bp] GUA ...  →  Frameshift gene knockout!", { size: 9.5, color: C.soft, mono: true });
      } else if (cur === 4) {
        roundRect(ctx, 48, 250, W - 96, 62, 8, C.greenBg, C.green, 1.6);
        label(ctx, W / 2, 270, "HDR / Base / Prime Editing: exact programmable rewrite", { size: 10.5, color: C.green });
        label(ctx, W / 2, 292, "Donor template or nCas9+deaminase/RT installs precise sequence!", { size: 9.5, color: C.soft });
      }

      const msgs = [
        "Without an adjacent PAM (5′-NGG-3′), Cas9 skips past matching sequences",
        "Zippering the 20-nt RNA–DNA R-loop checks specificity base by base",
        "Conformational snap activates HNH & RuvC → blunt double-strand break",
        "Cell repairs the break: NHEJ dominates in most cells → easy knockouts",
        "Supplying a donor (HDR) or nickase (Base/Prime) writes precise edits",
      ];
      badge(ctx, W / 2, H - 22, msgs[cur], C.bg, C.teal, C.tealDk);
    },
  };

  /* ── 8. Ch 50: Cohesin Loop Extrusion & Live Hi-C Contact Map ───────────── */
  SCENES["loop-extrusion-hic"] = {
    title: "CTCF–Cohesin Loop Extrusion Builds TADs on a Hi-C Map",
    subtitle: "Watch cohesin reel chromatin into a loop while the Hi-C triangle & corner dot form in real time",
    steps: [
      { title: "1. Cohesin loads onto chromatin", desc: "Ring-shaped cohesin complex embraces open chromatin fibre" },
      { title: "2. Bidirectional ATP extrusion", desc: "Cohesin reels DNA symmetrically through its ring → growing TAD square" },
      { title: "3. Left CTCF barrier stalls ring", desc: "Convergent (→) CTCF blocks left arm while right arm keeps reeling" },
      { title: "4. Both CTCF anchors stall → Dot!", desc: "Convergent → ... ← motifs lock a persistent loop & bright Hi-C corner dot" },
      { title: "5. Enhancer meets Promoter", desc: "Distal enhancer physically contacts its promoter inside the insulated TAD" },
    ],
    draw(ctx, W, H, s, t) {
      roundRect(ctx, 0, 0, W, H, 10, C.stage, C.rule, 1.2);
      const cur = Math.round(s);
      const ext = ease(clamp(s / 3, 0, 1));
      const locked = ease(clamp(s - 2.2, 0, 1));
      const contact = ease(clamp(s - 3.2, 0, 1));

      // Top half: Live Hi-C rotated triangle growing with extrusion!
      const gx0 = 64, gx1 = W - 64, gy = 164;
      const mid = (gx0 + gx1) / 2;
      const span = lerp(18, (gx1 - gx0) * 0.44, ext);
      // Full subtle background TAD outline
      ctx.fillStyle = "#ffffff"; ctx.strokeStyle = C.rule; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(gx0, gy); ctx.lineTo(gx1, gy); ctx.lineTo(mid, gy - 118); ctx.closePath(); ctx.fill(); ctx.stroke();
      // Active extruded contact triangle
      ctx.fillStyle = C.roseBg; ctx.strokeStyle = C.rose; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(mid - span, gy); ctx.lineTo(mid + span, gy); ctx.lineTo(mid, gy - span * 0.72); ctx.closePath(); ctx.fill(); ctx.stroke();
      label(ctx, mid, gy - span * 0.28, ext > 0.3 ? "TAD contacts" : "", { size: 9.5, color: C.rose });
      // Bright corner dot when both CTCFs stall cohesin!
      if (locked > 0.2) {
        const pulse = 6 + 2 * Math.sin(t * 5);
        ctx.fillStyle = C.rose;
        ctx.beginPath(); ctx.arc(mid, gy - span * 0.72, pulse * locked, 0, Math.PI * 2); ctx.fill();
        label(ctx, mid + 56, gy - span * 0.72, "Corner loop dot!", { size: 9.5, color: C.rose });
      }
      label(ctx, 20, 24, "Hi-C Contact Map (45°)", { size: 10, color: C.soft, align: "left" });

      // Bottom half: Physical chromatin fibre + cohesin ring extruding loop
      const fy = 286;
      const loopH = lerp(12, 82, ext);
      const cL = mid - lerp(14, 108, clamp(ext * 1.15));
      const cR = mid + lerp(14, 108, ext);

      ctx.strokeStyle = C.teal; ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(32, fy); ctx.lineTo(mid - 16, fy);
      ctx.bezierCurveTo(mid - 18, fy - loopH, mid - 72, fy - loopH * 1.15, mid, fy - loopH * 1.15);
      ctx.bezierCurveTo(mid + 72, fy - loopH * 1.15, mid + 18, fy - loopH, mid + 16, fy);
      ctx.lineTo(W - 32, fy);
      ctx.stroke();

      // Convergent CTCF markers at boundaries
      const ctcfL = lerp(66, mid - 46, clamp(ext * 1.15));
      const ctcfR = lerp(W - 66, mid + 46, ext);
      roundRect(ctx, ctcfL - 22, fy - 12, 44, 24, 5, C.blueBg, C.blue, 1.6);
      label(ctx, ctcfL, fy, "CTCF→", { size: 8.5, color: C.blue, mono: true });
      roundRect(ctx, ctcfR - 22, fy - 12, 44, 24, 5, C.blueBg, C.blue, 1.6);
      label(ctx, ctcfR, fy, "←CTCF", { size: 8.5, color: C.blue, mono: true });

      // Cohesin ring pinching the base of the loop
      ctx.fillStyle = C.amberBg; ctx.strokeStyle = C.amber; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.ellipse(mid, fy - 4, 22, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      label(ctx, mid, fy + 20, "Cohesin ring", { size: 9.5, color: C.amber });

      // Enhancer & Promoter dots brought together inside loop
      const ex = lerp(mid - 58, mid - 20, contact), ey = fy - loopH * 0.78;
      const px = lerp(mid + 58, mid + 20, contact), py = fy - loopH * 0.78;
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(ex, ey, 7, 0, Math.PI * 2); ctx.fill();
      label(ctx, ex - 22, ey - 10, "Enh", { size: 9, color: C.amber });
      ctx.fillStyle = C.purple; ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
      label(ctx, px + 22, py - 10, "Pro", { size: 9, color: C.purple });
      if (contact > 0.5) {
        dashedLine(ctx, ex + 7, ey, px - 7, py, C.purple, 2, [3, 2]);
        roundRect(ctx, mid - 54, ey - 42, 108, 19, 5, C.purpleBg, C.purple, 1.2);
        label(ctx, mid, ey - 32.5, "Active 3D contact!", { size: 9, color: C.purple });
      }

      const msgs = [
        "Cohesin loads anywhere along chromatin before loop extrusion starts",
        "ATP-driven extrusion pulls flanking DNA through the ring symmetrically",
        "A forward (→) CTCF motif blocks cohesin on the left side",
        "Convergent → ... ← CTCF anchors lock a stable TAD loop & Hi-C corner dot",
        "Enhancer and promoter inside the same TAD meet; outside genes stay insulated",
      ];
      badge(ctx, W / 2, H - 22, msgs[cur], C.bg, C.teal, C.tealDk);
    },
  };

  /* ── 9. Ch 56: Cancer Somatic Clonal Evolution Fishplot ─────────────────── */
  SCENES["cancer-clonal-evolution"] = {
    title: "Cancer as Somatic Darwinian Evolution (Interactive Fishplot)",
    subtitle: "Step from the first truncal driver through clonal branching and drug-selected relapse",
    steps: [
      { title: "1. Truncal Driver 1", desc: "Single somatic cell acquires an initiating driver (e.g. KRAS / APC)" },
      { title: "2. Primary expansion", desc: "Mutant clone sweeps the tissue niche, accumulating neutral passengers" },
      { title: "3. Branching subclones", desc: "Heterogeneity grows: dominant sensitive clone + rare resistant mutant" },
      { title: "4. Targeted therapy bottleneck", desc: "Drug wipes out 99% of sensitive tumour cells — tumour shrinks" },
      { title: "5. Resistant relapse", desc: "Pre-existing resistant clone survives bottleneck and dominates relapse" },
    ],
    draw(ctx, W, H, s) {
      roundRect(ctx, 0, 0, W, H, 10, C.stage, C.rule, 1.2);
      const cur = Math.round(s);
      const prog = ease(clamp((s + 0.3) / 4.3, 0, 1));
      const maxX = lerp(95, W - 26, prog);
      const cy = H / 2 - 10;

      // Clip to current timeline horizon maxX!
      ctx.save();
      ctx.beginPath(); ctx.rect(20, 28, maxX - 20, H - 72); ctx.clip();

      // Trunk clone (teal)
      const poly = (pts, fill, stroke, lw = 1.8) => {
        ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = lw;
        ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
        ctx.closePath(); ctx.fill(); ctx.stroke();
      };
      poly([[34, cy - 4], [115, cy - 58], [245, cy - 82], [312, cy - 18], [W - 28, cy - 72],
            [W - 28, cy + 72], [312, cy + 20], [245, cy + 82], [115, cy + 58], [34, cy + 4]], C.tealBg, C.teal);
      // Sensitive subclone (blue) — dies at bottleneck x=312!
      poly([[150, cy - 44], [245, cy - 66], [302, cy - 10], [245, cy + 10]], C.blueBg, C.blue);
      // Resistant subclone (rose) — tiny before drug, explodes after x=312!
      poly([[205, cy + 42], [255, cy + 56], [312, cy + 12], [W - 28, cy - 58], [W - 28, cy + 62], [312, cy + 18]], C.roseBg, C.rose, 2);

      // Therapy line at x=312
      if (maxX > 300) {
        dashedLine(ctx, 312, 46, 312, H - 56, C.amber, 2.2, [5, 4]);
        label(ctx, 312, 38, "Targeted Drug", { size: 10, color: C.amber });
      }
      ctx.restore();

      // Timeline cursor line
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(maxX, 46); ctx.lineTo(maxX, H - 56); ctx.stroke();

      if (cur >= 0) label(ctx, 84, cy, "Driver 1", { size: 9.5, color: C.tealDk });
      if (cur >= 2) label(ctx, 224, cy - 30, "Sensitive", { size: 9.5, color: C.blue });
      if (cur >= 2 && cur < 4) label(ctx, 250, cy + 48, "Rare resistant", { size: 8.8, color: C.rose });
      if (cur >= 4) label(ctx, W - 76, cy + 4, "Resistant relapse!", { size: 10, color: C.rose });

      const msgs = [
        "Tumour begins from one normal cell acquiring a clonal truncal driver",
        "Clonal expansion sweeps the niche; >95% of mutations are passengers",
        "Subclones diverge — drug-resistant cells often pre-exist BEFORE therapy",
        "Targeted therapy imposes a brutal Darwinian bottleneck on sensitive clones",
        "Surviving resistant clone expands → why combination therapy beats single drugs",
      ];
      badge(ctx, W / 2, H - 22, msgs[cur], C.bg, cur === 4 ? C.rose : C.teal, cur === 4 ? C.rose : C.tealDk);
    },
  };

  /* ── 10. Ch D3: CAG Hairpin + MutSβ/MutLγ Somatic Expansion Engine ─────── */
  SCENES["sca12-repeat-expansion"] = {
    title: "How Mismatch Repair Drives Somatic CAG Repeat Expansion",
    subtitle: "Step through how MutSβ (MSH2–MSH3) & MutLγ turn a CAG slip-out into permanent +ΔCAG growth",
    steps: [
      { title: "1. Long (CAG)ₙ tract opens", desc: "Transcription or base-excision repair transiently melts the repeat duplex" },
      { title: "2. Imperfect CAG hairpin slips out", desc: "Repeated CAGs fold back into a metastable loop (G–C pairs + A–A mismatches)" },
      { title: "3. MutSβ binds & stabilises loop", desc: "MSH2–MSH3 recognises the slip-out but locks it in place instead of removing it" },
      { title: "4. MutLγ nicks OPPOSITE strand", desc: "MLH1–MLH3 endonuclease cuts the intact template strand across from the loop" },
      { title: "5. Gap-fill locks in +ΔCAG", desc: "Polymerase uses the looped strand as template → net repeat expansion!" },
    ],
    draw(ctx, W, H, s, t) {
      roundRect(ctx, 0, 0, W, H, 10, C.stage, C.rule, 1.2);
      const cur = Math.round(s);
      const loopP = ease(clamp(s - 0.1, 0, 1));
      const muts = ease(clamp(s - 1.1, 0, 1));
      const nick = ease(clamp(s - 2.1, 0, 1));
      const expand = ease(clamp(s - 3.1, 0, 1));

      const cx = W / 2, cy = 196;
      const lh = loopP * (1 - expand * 0.85) * 86;

      // Top strand (forms CAG hairpin, then flattens out longer in Step 5!)
      ctx.strokeStyle = expand > 0.5 ? C.teal : C.rose; ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(28, cy - 16); ctx.lineTo(cx - 32, cy - 16);
      if (lh > 4) {
        ctx.lineTo(cx - 24, cy - 16 - lh);
        ctx.bezierCurveTo(cx - 24, cy - 42 - lh, cx + 24, cy - 42 - lh, cx + 24, cy - 16 - lh);
        ctx.lineTo(cx + 32, cy - 16);
      } else {
        ctx.lineTo(cx + 32, cy - 16);
      }
      ctx.lineTo(W - 28, cy - 16);
      ctx.stroke();

      // Internal CAG hairpin rungs (G-C + A-A mismatches)
      if (lh > 26) {
        for (let y = cy - 30; y > cy - 12 - lh; y -= 16) {
          dashedLine(ctx, cx - 20, y, cx + 20, y, C.amber, 2, [3, 2]);
        }
        label(ctx, cx, cy - 46 - lh, "CAG·CAG hairpin", { size: 10, color: C.rose });
      }

      // Bottom strand (intact -> nicked at center -> filled with new amber CAGs!)
      const gap = (nick > 0.3 && expand < 0.5) ? 14 : 0;
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3.6;
      ctx.beginPath(); ctx.moveTo(28, cy + 16); ctx.lineTo(cx - gap, cy + 16); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + gap, cy + 16); ctx.lineTo(W - 28, cy + 16); ctx.stroke();

      if (expand > 0.3) {
        ctx.strokeStyle = C.amber; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(cx - 56 * expand, cy + 16); ctx.lineTo(cx + 56 * expand, cy + 16); ctx.stroke();
        label(ctx, cx, cy + 38, "Newly synthesised +ΔCAG repeat bases!", { size: 10, color: C.amber });
      }

      // MutSbeta protein hugging loop
      if (muts > 0.1 && expand < 0.7) {
        const mv = muts * (1 - expand);
        roundRect(ctx, cx - 56, cy - 22 - lh * 0.65, 112, 30, 14, mixHex(C.stage, C.purpleBg, mv), mixHex(C.stage, C.purple, mv), 2);
        label(ctx, cx, cy - 7 - lh * 0.65, "MutSβ (MSH2/3)", { size: 9.5, color: mixHex(C.stage, C.purple, mv) });
      }

      // MutLgamma scissors nicking bottom strand
      if (nick > 0.2 && expand < 0.6) {
        roundRect(ctx, cx - 54, cy + 32, 108, 26, 12, C.roseBg, C.rose, 1.8);
        label(ctx, cx, cy + 45, "▲ MutLγ nicks here!", { size: 9.5, color: C.rose });
      }

      const msgs = [
        "Expanded (CAG)ₙ tracts open frequently during transcription & BER",
        "Slipped repeats snap into a stable hairpin loop with A–A mismatches",
        "MutSβ (MSH2–MSH3) binds the hairpin — locking it in instead of excising",
        "MutLγ (MLH1–MLH3) nicks the OPPOSITE strand (the fatal error!)",
        "Gap-filling copies the extra loop → repeats grow over decades in neurons!",
      ];
      badge(ctx, W / 2, H - 22, msgs[cur], C.bg, cur >= 3 ? C.rose : C.teal, cur >= 3 ? C.rose : C.tealDk);
    },
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     INTERACTIVE MOUNTING ENGINE
     ═══════════════════════════════════════════════════════════════════════════ */

  function mountWalkthrough(el) {
    const id = el.dataset.walkthrough;
    const spec = SCENES[id];
    if (!spec || el.dataset.swMounted) return;
    el.dataset.swMounted = "1";

    let targetStep = 0;
    let displayStep = 0;
    let playing = false;
    let playTimer = 0;
    let lastTs = 0;

    el.innerHTML = "";
    el.classList.add("sw-card");

    // Header
    const head = document.createElement("div");
    head.className = "sw-head";
    head.innerHTML = `
      <div class="sw-titles">
        <div class="sw-title">${spec.title}</div>
        <div class="sw-sub">${spec.subtitle}</div>
      </div>
      <div class="sw-controls">
        <button type="button" class="sw-btn" data-act="prev" title="Previous step">←</button>
        <span class="sw-counter">1 / ${spec.steps.length}</span>
        <button type="button" class="sw-btn" data-act="next" title="Next step">→</button>
        <button type="button" class="sw-btn sw-play" data-act="play" title="Auto-play walkthrough">▶ Play</button>
      </div>
    `;
    el.appendChild(head);

    // Thin progress bar
    const prog = document.createElement("div");
    prog.className = "sw-prog";
    const segs = spec.steps.map(() => {
      const sp = document.createElement("span");
      prog.appendChild(sp);
      return sp;
    });
    el.appendChild(prog);

    // Body: Left canvas + Right clickable step tiles
    const body = document.createElement("div");
    body.className = "sw-body";
    const stageWrap = document.createElement("div");
    stageWrap.className = "sw-stage";
    const canvas = document.createElement("canvas");
    canvas.width = 450 * 2;
    canvas.height = 350 * 2;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", spec.title);
    stageWrap.appendChild(canvas);

    const rail = document.createElement("div");
    rail.className = "sw-rail";
    const tiles = spec.steps.map((st, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sw-tile";
      btn.innerHTML = `
        <span class="sw-dot" aria-hidden="true"></span>
        <span class="sw-tile-txt">
          <strong>${st.title}</strong>
          <span>${st.desc}</span>
        </span>
      `;
      btn.addEventListener("click", () => {
        playing = false;
        syncPlayBtn();
        setStep(idx);
      });
      rail.appendChild(btn);
      return btn;
    });

    body.appendChild(stageWrap);
    body.appendChild(rail);
    el.appendChild(body);

    const counter = head.querySelector(".sw-counter");
    const playBtn = head.querySelector('[data-act="play"]');

    function syncPlayBtn() {
      playBtn.textContent = playing ? "⏸ Pause" : "▶ Play";
      playBtn.classList.toggle("is-playing", playing);
    }

    function setStep(idx) {
      targetStep = clamp(idx, 0, spec.steps.length - 1);
      playTimer = 0;
      counter.textContent = `${targetStep + 1} / ${spec.steps.length}`;
      tiles.forEach((b, i) => {
        b.classList.toggle("is-active", i === targetStep);
        b.classList.toggle("is-done", i < targetStep);
        b.setAttribute("aria-current", i === targetStep ? "step" : "false");
      });
      segs.forEach((sp, i) => {
        sp.classList.toggle("is-active", i === targetStep);
        sp.classList.toggle("is-done", i < targetStep);
      });
    }

    head.querySelector('[data-act="prev"]').addEventListener("click", () => {
      playing = false; syncPlayBtn();
      setStep((targetStep - 1 + spec.steps.length) % spec.steps.length);
    });
    head.querySelector('[data-act="next"]').addEventListener("click", () => {
      playing = false; syncPlayBtn();
      setStep((targetStep + 1) % spec.steps.length);
    });
    playBtn.addEventListener("click", () => {
      playing = !playing;
      if (playing && targetStep === spec.steps.length - 1) setStep(0);
      syncPlayBtn();
    });

    // Resize canvas crisply for Retina DPI
    const ctx = canvas.getContext("2d");
    const LOG_W = 450, LOG_H = 350;
    function syncSize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = LOG_W * dpr;
      canvas.height = LOG_H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    syncSize();
    setStep(0);

    // Pause animation loop cleanly when scrolled off-screen
    let visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
      }, { threshold: 0.05 }).observe(el);
    }

    function tick(ts) {
      const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
      lastTs = ts;
      if (visible) {
        if (playing) {
          playTimer += dt;
          if (playTimer >= 3.2) {
            playTimer = 0;
            setStep((targetStep + 1) % spec.steps.length);
          }
        }
        // Smooth exponential tween toward clicked target step
        const diff = targetStep - displayStep;
        displayStep += Math.abs(diff) < 0.002 ? diff : diff * Math.min(1, dt * 6.5);
        ctx.clearRect(0, 0, LOG_W, LOG_H);
        spec.draw(ctx, LOG_W, LOG_H, displayStep, ts / 1000);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initAll() {
    document.querySelectorAll(".step-walkthrough[data-walkthrough]").forEach(mountWalkthrough);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
