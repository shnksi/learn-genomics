"""Generate a crisp 2x-supersampled 3D animated GIF deriving the DNA double helix from chemistry alone.

Choreographs all 7 physical constraints from Ch 01 Worked Example:
  1. Charged backbone outside, hydrophobic bases inside
  2. Flat bases stack face-to-face (3.4 Å pi-stacking)
  3. Second strand enters to satisfy buried H-bond donors/acceptors
  4. Purine + Pyrimidine (A-T, G-C) keeps constant ~20 Å width
  5. Ladder twists into right-handed helix (~10.5 bp/turn)
  6. Antiparallel polarity (5'->3' vs 3'<-5')
  7. Offset attachment opens Major (~22 Å) vs Minor (~12 Å) grooves + TF alpha-helix docking
"""
from __future__ import annotations
import math
import shutil
import subprocess
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent.parent
OUT_GIF = ROOT / "figures" / "anim-01-helix-derivation.gif"
SCRATCH_PREVIEW = Path("/Users/shnksi/.gemini/antigravity/brain/456fdc3d-ea29-4980-ad0c-6ce136ba7122/scratch/helix_frames")

# Render at 2x for ultra-crisp anti-aliased downsampling
S = 2
W, H = 760, 440
RW, RH = W * S, H * S

# Palette matching learn-genomics reader.css
BG = (255, 255, 255)
PANEL = (247, 250, 249)
WATER_BG = (238, 248, 250)
RULE = (209, 221, 219)
INK = (20, 34, 38)
SOFT = (68, 88, 92)
FAINT = (130, 148, 152)

TEAL = (15, 118, 110)
TEAL_DK = (17, 94, 89)
TEAL_LT = (94, 190, 180)
TEAL_BG = (229, 246, 244)

AMBER = (180, 83, 9)
AMBER_LT = (234, 158, 66)
AMBER_BG = (254, 243, 199)

BLUE = (29, 78, 216)
BLUE_BG = (239, 246, 255)
ROSE = (190, 18, 60)
ROSE_BG = (255, 241, 242)
PURPLE = (109, 40, 217)
PURPLE_BG = (245, 243, 255)

BASE_COL = {"A": TEAL, "T": ROSE, "G": AMBER, "C": BLUE}
BASE_BG = {"A": TEAL_BG, "T": ROSE_BG, "G": AMBER_BG, "C": BLUE_BG}
PAIR_SEQ = [
    ("A", "T", 2), ("G", "C", 3), ("C", "G", 3), ("T", "A", 2),
    ("A", "T", 2), ("G", "C", 3), ("T", "A", 2), ("C", "G", 3),
    ("G", "C", 3), ("A", "T", 2), ("C", "G", 3), ("T", "A", 2),
]

STEPS = [
    ("1. Charged backbone outside", "Water hydrates phosphate (-); bases go inside"),
    ("2. Flat bases stack (3.4 Å)", "Face-to-face π-stacking excludes water"),
    ("3. Second strand enters", "Buried bases pair to satisfy open H-bonds"),
    ("4. Purine + Pyrimidine (~20 Å)", "A=T (2H) & G≡C (3H) keep uniform width"),
    ("5. Helix twists (10.5 bp/turn)", "Backbone geometry forces 34.3° rotation"),
    ("6. Antiparallel polarity", "5′→3′ strand pairs with 3′←5′ partner"),
    ("7. Major vs. Minor grooves", "Offset backbones let TFs read DNA closed"),
]

# Timeline in seconds (total 22.0s @ 12 fps = 264 frames -> smooth & lightweight!)
FPS = 12
DURATIONS = [2.8, 2.7, 2.8, 2.9, 3.4, 2.7, 4.7]
TOTAL_SEC = sum(DURATIONS)
TOTAL_FRAMES = int(round(TOTAL_SEC * FPS))


def load_font(size: int, bold: bool = False, mono: bool = False):
    px = int(size * S)
    if mono:
        for p in ("/System/Library/Fonts/Menlo.ttc", "/System/Library/Fonts/Supplemental/Arial.ttf"):
            if Path(p).is_file():
                return ImageFont.truetype(p, px, index=1 if (bold and p.endswith(".ttc")) else 0)
    else:
        if bold:
            for p in ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", "/System/Library/Fonts/HelveticaNeue.ttc"):
                if Path(p).is_file():
                    return ImageFont.truetype(p, px)
        else:
            for p in ("/System/Library/Fonts/Supplemental/Arial.ttf", "/System/Library/Fonts/HelveticaNeue.ttc"):
                if Path(p).is_file():
                    return ImageFont.truetype(p, px)
    return ImageFont.load_default()


F_TITLE = load_font(14, bold=True)
F_SUB = load_font(10, bold=False)
F_BADGE = load_font(10, bold=True)
F_STEP_T = load_font(10.5, bold=True)
F_STEP_D = load_font(9.2, bold=False)
F_MONO = load_font(9.5, bold=True, mono=True)
F_TINY = load_font(8.8, bold=True)
F_BASE = load_font(9.0, bold=True, mono=True)


def clamp(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, v))


def ease(t: float) -> float:
    t = clamp(t)
    return t * t * (3.0 - 2.0 * t)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def blend_rgb(c1: tuple[int, int, int], c2: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    t = clamp(t)
    return tuple(int(round(lerp(a, b, t))) for a, b in zip(c1, c2))


def draw_dashed_line(d: ImageDraw.ImageDraw, p1, p2, fill, width: int, dash: int = 8, gap: int = 6):
    x1, y1 = p1
    x2, y2 = p2
    dist = math.hypot(x2 - x1, y2 - y1)
    if dist < 1:
        return
    ux, uy = (x2 - x1) / dist, (y2 - y1) / dist
    pos = 0.0
    while pos < dist:
        end = min(dist, pos + dash)
        d.line([(x1 + ux * pos, y1 + uy * pos), (x1 + ux * end, y1 + uy * end)], fill=fill, width=width)
        pos += dash + gap


def draw_arrow(d: ImageDraw.ImageDraw, p1, p2, fill, width: int, head: int = 12):
    x1, y1 = p1
    x2, y2 = p2
    d.line([(x1, y1), (x2, y2)], fill=fill, width=width)
    ang = math.atan2(y2 - y1, x2 - x1)
    a1 = ang + math.pi * 0.82
    a2 = ang - math.pi * 0.82
    d.polygon([
        (x2, y2),
        (x2 + head * math.cos(a1), y2 + head * math.sin(a1)),
        (x2 + head * math.cos(a2), y2 + head * math.sin(a2)),
    ], fill=fill)


def step_progress(t_sec: float) -> tuple[int, float]:
    acc = 0.0
    for idx, dur in enumerate(DURATIONS):
        if t_sec < acc + dur or idx == len(DURATIONS) - 1:
            return idx, clamp((t_sec - acc) / dur)
        acc += dur
    return len(DURATIONS) - 1, 1.0


def render_frame(frame_idx: int) -> Image.Image:
    t_sec = frame_idx / FPS
    step, local = step_progress(t_sec)

    # Continuous physical parameters driven cleanly by step + local time
    # p1: straightening backbone outside & tucking bases inside
    p1 = ease(local / 0.55) if step == 0 else 1.0
    # p2: face-to-face vertical stacking compression
    p2 = 0.0 if step < 1 else (ease(local / 0.55) if step == 1 else 1.0)
    # p3: second strand gliding in from right
    p3 = 0.0 if step < 2 else (ease(local / 0.55) if step == 2 else 1.0)
    # p4: base-pair H-bonds & constant-width lock-in
    p4 = 0.0 if step < 3 else (ease(local / 0.45) if step == 3 else 1.0)
    # p5: 3D helical twist (0 -> 34.3 deg/bp)
    p5 = 0.0 if step < 4 else (ease(local / 0.65) if step == 4 else 1.0)
    # p6: antiparallel polarity arrows
    p6 = 0.0 if step < 5 else (ease(local / 0.45) if step == 5 else 1.0)
    # p7: asymmetric groove offset (180 deg -> 132 deg) + TF alpha-helix docking + gentle turntable spin
    p7 = 0.0 if step < 6 else ease(local / 0.35)
    tf_dock = 0.0 if step < 6 else ease((local - 0.28) / 0.30)

    # Gentle turntable rotation once twisted (gives unmistakable 3D volume!)
    spin = 0.0
    if step == 4:
        spin = 0.25 * ease(local)
    elif step == 5:
        spin = 0.25 + 0.35 * local
    elif step == 6:
        spin = 0.60 + 2.0 * math.pi * 0.48 * ease((local - 0.10) / 0.85)

    img = Image.new("RGB", (RW, RH), BG)
    d = ImageDraw.Draw(img)

    # --- Header ---
    d.text((22 * S, 13 * S), "Deriving the DNA Double Helix from Chemistry Alone", font=F_TITLE, fill=INK)
    d.text((22 * S, 32 * S), "Put a negatively charged backbone with flat nonpolar bases in water → every feature is forced", font=F_SUB, fill=FAINT)
    # Step progress pill top-right
    pill_x, pill_y, pill_w, pill_h = 626 * S, 14 * S, 112 * S, 24 * S
    d.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h], radius=12 * S, fill=TEAL_BG, outline=TEAL, width=2)
    d.text((pill_x + pill_w / 2, pill_y + 5 * S), f"Step {step + 1} of 7", font=F_BADGE, fill=TEAL_DK, anchor="ma")

    # 7-segment thin progress bar under header
    for k in range(7):
        bx = (22 + k * 103.5) * S
        bw = 98 * S
        fill_bar = TEAL if k < step else (TEAL_LT if k == step else RULE)
        d.rounded_rectangle([bx, 50 * S, bx + bw, 54 * S], radius=2 * S, fill=fill_bar)

    # --- Left 3D Molecular Stage ---
    sx0, sy0, sx1, sy1 = 22 * S, 64 * S, 466 * S, 422 * S
    d.rounded_rectangle([sx0, sy0, sx1, sy1], radius=12 * S, fill=WATER_BG, outline=RULE, width=2)
    stage_cx = (sx0 + sx1) / 2
    stage_cy = (sy0 + sy1) / 2 - 4 * S

    # Subtle drifting water molecules (H2O) around outer aqueous region
    water_seeds = [
        (52, 92, 0.7), (430, 96, 1.3), (46, 168, 2.1), (434, 174, 0.4),
        (56, 250, 1.8), (428, 260, 2.7), (50, 336, 0.9), (434, 344, 1.6),
        (98, 396, 2.4), (392, 394, 0.2), (96, 94, 1.1), (390, 98, 2.9),
    ]
    for wx, wy, ph in water_seeds:
        dx = 6 * math.sin(t_sec * 1.4 + ph)
        dy = 5 * math.cos(t_sec * 1.1 + ph * 1.3)
        px, py = (wx + dx) * S, (wy + dy) * S
        # Oxygen + two hydrogens tiny water icon
        d.ellipse([px - 5 * S, py - 5 * S, px + 5 * S, py + 5 * S], fill=(196, 230, 240), outline=(145, 200, 218), width=2)
        d.ellipse([px - 8 * S, py + 2 * S, px - 3 * S, py + 7 * S], fill=(255, 255, 255), outline=(145, 200, 218), width=1)
        d.ellipse([px + 3 * S, py + 2 * S, px + 8 * S, py + 7 * S], fill=(255, 255, 255), outline=(145, 200, 218), width=1)
    d.text((sx0 + 12 * S, sy0 + 9 * S), "Aqueous solvent (polar H2O)", font=F_TINY, fill=(75, 136, 152))

    # --- Compute 3D geometry of 12 base pairs ---
    n_bp = len(PAIR_SEQ)
    # Vertical spacing compresses in Step 2 (stacking!)
    dy_step = lerp(23.8, 21.0, p2) * S
    helix_r = 76.0 * S  # radius of sugar-phosphate backbone cylinder
    # Offset between strand 1 and strand 2 angles: 180 deg in Step 4-6 -> 134 deg in Step 7 (creates Major vs Minor grooves!)
    strand_offset = math.radians(lerp(180.0, 134.0, p7))
    twist_per_bp = math.radians(360.0 / 10.5) * p5

    s1_pts = []  # (x, y, z, angle)
    s2_pts = []
    for i in range(n_bp):
        u = i - (n_bp - 1) / 2.0
        base_y = stage_cy + u * dy_step
        # Initial Step 0 wiggle before straightening into backbone-outside
        wiggle_x = (1.0 - p1) * (24 * S * math.sin(i * 1.15 + t_sec * 1.5))
        wiggle_y = (1.0 - p1) * (6 * S * math.cos(i * 0.9))

        ang1 = math.pi + u * twist_per_bp + spin  # starts at left (pi) when untwisted
        ang2 = ang1 + strand_offset               # starts at right (0) when untwisted

        # Before Step 3, strand 1 sits slightly centered; glides smoothly to helix_r
        cx_shift = lerp(-24 * S, 0.0, p3)
        x1 = stage_cx + cx_shift + helix_r * math.cos(ang1) + wiggle_x
        z1 = helix_r * math.sin(ang1)
        y1 = base_y + wiggle_y
        s1_pts.append((x1, y1, z1, ang1))

        # Strand 2 glides in from far right during Step 3
        enter_dx = (1.0 - p3) * 145 * S
        x2 = stage_cx + cx_shift + helix_r * math.cos(ang2) + enter_dx
        z2 = helix_r * math.sin(ang2)
        y2 = base_y
        s2_pts.append((x2, y2, z2, ang2))

    # Build z-sorted draw list so 3D front/back occlusion is physically accurate!
    drawables: list[tuple[float, callable]] = []

    # 1. Sugar-phosphate backbone segments (interpolated smoothly with cubic/linear sub-segments)
    def add_backbone_segments(pts, col_front, col_back, alpha_vis: float, strand_id: int):
        if alpha_vis <= 0.02:
            return
        for i in range(len(pts) - 1):
            xA, yA, zA, _ = pts[i]
            xB, yB, zB, _ = pts[i + 1]
            # Subdivide each step into 4 mini-segments for silky curved ribbons!
            for s_idx in range(4):
                f0, f1 = s_idx / 4.0, (s_idx + 1) / 4.0
                # Smoothly curve along the cylinder when twisted
                if p5 > 0.05:
                    aA, aB = pts[i][3], pts[i + 1][3]
                    am0 = lerp(aA, aB, f0)
                    am1 = lerp(aA, aB, f1)
                    cx_shift = lerp(-24 * S, 0.0, p3)
                    enter_dx = 0.0 if strand_id == 1 else (1.0 - p3) * 145 * S
                    px0 = stage_cx + cx_shift + helix_r * math.cos(am0) + enter_dx
                    pz0 = helix_r * math.sin(am0)
                    py0 = lerp(yA, yB, f0)
                    px1 = stage_cx + cx_shift + helix_r * math.cos(am1) + enter_dx
                    pz1 = helix_r * math.sin(am1)
                    py1 = lerp(yA, yB, f1)
                else:
                    px0, py0, pz0 = lerp(xA, xB, f0), lerp(yA, yB, f0), lerp(zA, zB, f0)
                    px1, py1, pz1 = lerp(xA, xB, f1), lerp(yA, yB, f1), lerp(zA, zB, f1)
                z_mid = (pz0 + pz1) / 2.0
                depth = clamp((z_mid / helix_r + 1.0) / 2.0)  # 0=back, 1=front
                col = blend_rgb(col_back, col_front, depth)
                col = blend_rgb(WATER_BG, col, alpha_vis)
                thick = int(round(lerp(5.5, 11.0, depth) * S))

                def _draw_seg(p0=(px0, py0), p1=(px1, py1), c=col, w=thick):
                    d.line([p0, p1], fill=c, width=w, joint="curve")
                    # Rounded endcap circle for buttery smoothness
                    r = w // 2
                    d.ellipse([p0[0] - r, p0[1] - r, p0[0] + r, p0[1] + r], fill=c)

                drawables.append((z_mid, _draw_seg))

    add_backbone_segments(s1_pts, TEAL, (125, 182, 178), 1.0, 1)
    add_backbone_segments(s2_pts, AMBER, (218, 172, 128), p3, 2)

    # 2. Negative phosphate charge beads (PO4-) on backbone nodes
    for i in range(n_bp):
        for strand_id, pts, col_f, col_b, vis in [
            (1, s1_pts, TEAL_DK, (125, 182, 178), 1.0),
            (2, s2_pts, AMBER, (218, 172, 128), p3),
        ]:
            if vis <= 0.05:
                continue
            x, y, z, _ = pts[i]
            depth = clamp((z / helix_r + 1.0) / 2.0)
            r = int(round(lerp(5.5, 8.5, depth) * S))
            col = blend_rgb(WATER_BG, blend_rgb(col_b, col_f, depth), vis)
            fill_in = blend_rgb(WATER_BG, (255, 255, 255), vis)

            def _draw_p(px=x, py=y, rr=r, cf=col, fi=fill_in, show_minus=(step <= 1)):
                d.ellipse([px - rr, py - rr, px + rr, py + rr], fill=fi, outline=cf, width=3)
                if show_minus:
                    d.line([(px - rr * 0.45, py), (px + rr * 0.45, py)], fill=cf, width=3)

            drawables.append((z + 4.0, _draw_p))

    # 3. Planar bases & Watson-Crick H-bond rungs
    for i, (b1, b2, nhb) in enumerate(PAIR_SEQ):
        x1, y1, z1, _ = s1_pts[i]
        x2, y2, z2, _ = s2_pts[i]
        # Before Step 1 settles, bases dangle at messy random angles; Step 1-2 aligns flat & stacked!
        tilt = (1.0 - p2) * (0.45 * math.sin(i * 1.7 + 0.5)) * (1.0 - 0.5 * p1)
        is_pur1 = b1 in ("A", "G")
        frac1 = 0.53 if is_pur1 else 0.35  # purine wider than pyrimidine!

        z_mid = (z1 + z2) / 2.0
        depth = clamp((z_mid / helix_r + 1.0) / 2.0)

        # Anchor point of strand 1's base tip
        if p3 > 0.05:
            # Interpolate toward strand 2 across the rung
            vx, vy = (x2 - x1), (y2 - y1)
        else:
            # Pointing rightward inward from strand 1 (or randomly out at t=0)
            flip_out = -1.0 if (i % 3 == 0 and p1 < 0.35) else 1.0
            vx = lerp(flip_out * 95 * S, 130 * S, p1)
            vy = tilt * 48 * S

        # Draw base 1 bar + optional base 2 bar + H-bonds
        c1 = blend_rgb((185, 205, 208), BASE_COL[b1], 0.45 + 0.55 * depth)
        c2 = blend_rgb((185, 205, 208), BASE_COL[b2], 0.45 + 0.55 * depth)
        bh = int(round(lerp(5.5, 9.0, depth) * S))

        def _draw_rung(
            xa=x1, ya=y1, xb=x2, yb=y2, dx=vx, dy=vy, f1=frac1,
            col1=c1, col2=c2, hbar=bh, lb1=b1, lb2=b2, hb=nhb,
            vis2=p3, show_hb=p4, step_now=step, idx_i=i, t_s=t_sec,
        ):
            # Strand 1 base block
            t1_x = xa + dx * (f1 if vis2 > 0.05 else 0.44)
            t1_y = ya + dy * (f1 if vis2 > 0.05 else 0.44)
            d.line([(xa, ya), (t1_x, t1_y)], fill=col1, width=hbar)
            # Small base pill if flat enough (Steps 3-4)
            if show_hb > 0.35 and p5 < 0.65 and abs(xb - xa) > 80 * S:
                mx1, my1 = (xa + t1_x) / 2, (ya + t1_y) / 2
                d.rounded_rectangle([mx1 - 11 * S, my1 - 7.5 * S, mx1 + 11 * S, my1 + 7.5 * S], radius=4 * S, fill=BG, outline=col1, width=2)
                d.text((mx1, my1 - 5.5 * S), lb1, font=F_BASE, fill=col1, anchor="ma")

            # Unsatisfied H-bond coral pulses in Step 3 before strand 2 arrives!
            if step_now == 2 and vis2 < 0.85:
                pulse = 0.5 + 0.5 * math.sin(t_s * 8 + idx_i)
                pcol = blend_rgb(WATER_BG, ROSE, (1.0 - vis2) * (0.4 + 0.6 * pulse))
                for off in (-4 * S, 4 * S):
                    d.ellipse([t1_x + 4 * S, t1_y + off - 2.5 * S, t1_x + 9 * S, t1_y + off + 2.5 * S], fill=pcol)

            # Strand 2 base block
            if vis2 > 0.05:
                f2 = 0.35 if lb1 in ("A", "G") else 0.53
                t2_x = xb - dx * f2
                t2_y = yb - dy * f2
                col2_v = blend_rgb(WATER_BG, col2, vis2)
                d.line([(xb, yb), (t2_x, t2_y)], fill=col2_v, width=hbar)
                if show_hb > 0.35 and p5 < 0.65 and abs(xb - xa) > 80 * S:
                    mx2, my2 = (xb + t2_x) / 2, (yb + t2_y) / 2
                    d.rounded_rectangle([mx2 - 11 * S, my2 - 7.5 * S, mx2 + 11 * S, my2 + 7.5 * S], radius=4 * S, fill=BG, outline=col2_v, width=2)
                    d.text((mx2, my2 - 5.5 * S), lb2, font=F_BASE, fill=col2_v, anchor="ma")

                # Hydrogen bonds connecting tips (2 or 3 parallel dotted lines!)
                if show_hb > 0.05:
                    hb_col = blend_rgb(WATER_BG, SOFT, show_hb * 0.85)
                    offs = [-4 * S, 4 * S] if hb == 2 else [-5 * S, 0, 5 * S]
                    for oy in offs:
                        draw_dashed_line(d, (t1_x, t1_y + oy), (t2_x, t2_y + oy), hb_col, width=2, dash=5, gap=4)

        drawables.append((z_mid - 2.0, _draw_rung))

    # Execute z-sorted painter's algorithm!
    drawables.sort(key=lambda item: item[0])
    for _, fn in drawables:
        fn()

    # --- Step-specific crisp stage annotations ---
    if step == 0:
        d.rounded_rectangle([sx0 + 18 * S, sy1 - 36 * S, sx1 - 18 * S, sy1 - 10 * S], radius=7 * S, fill=BG, outline=TEAL, width=2)
        d.text((stage_cx, sy1 - 29 * S), "Negatively charged backbone faces water; nonpolar bases tuck inward", font=F_TINY, fill=TEAL_DK, anchor="ma")
    elif step == 1:
        # 3.4 Å stacking caliper between bp 4 and 5
        yA, yB = s1_pts[4][1], s1_pts[5][1]
        cx_cal = stage_cx + 88 * S
        d.line([(cx_cal, yA), (cx_cal, yB)], fill=AMBER, width=3)
        d.line([(cx_cal - 6 * S, yA), (cx_cal + 6 * S, yA)], fill=AMBER, width=3)
        d.line([(cx_cal - 6 * S, yB), (cx_cal + 6 * S, yB)], fill=AMBER, width=3)
        d.text((cx_cal + 12 * S, (yA + yB) / 2 - 7 * S), "3.4 Å π-stacking", font=F_TINY, fill=AMBER)
        d.rounded_rectangle([sx0 + 18 * S, sy1 - 36 * S, sx1 - 18 * S, sy1 - 10 * S], radius=7 * S, fill=AMBER_BG, outline=AMBER, width=2)
        d.text((stage_cx, sy1 - 29 * S), "Face-to-face base stacking = #1 driver of helix stability!", font=F_TINY, fill=AMBER, anchor="ma")
    elif step == 2:
        d.rounded_rectangle([sx0 + 18 * S, sy1 - 36 * S, sx1 - 18 * S, sy1 - 10 * S], radius=7 * S, fill=ROSE_BG, outline=ROSE, width=2)
        d.text((stage_cx, sy1 - 29 * S), "Buried bases have open H-bonds → 2nd strand glides in to pair", font=F_TINY, fill=ROSE, anchor="ma")
    elif step == 3:
        # Top constant width ~20 Å caliper
        xL, xR = s1_pts[0][0], s2_pts[0][0]
        y_top = s1_pts[0][1] - 20 * S
        d.line([(xL, y_top), (xR, y_top)], fill=TEAL_DK, width=3)
        d.line([(xL, y_top - 6 * S), (xL, y_top + 6 * S)], fill=TEAL_DK, width=3)
        d.line([(xR, y_top - 6 * S), (xR, y_top + 6 * S)], fill=TEAL_DK, width=3)
        d.text(((xL + xR) / 2, y_top - 15 * S), "Constant ~20 Å diameter (Purine + Pyrimidine)", font=F_TINY, fill=TEAL_DK, anchor="ma")
    elif step == 4:
        d.rounded_rectangle([sx0 + 18 * S, sy1 - 36 * S, sx1 - 18 * S, sy1 - 10 * S], radius=7 * S, fill=TEAL_BG, outline=TEAL, width=2)
        d.text((stage_cx, sy1 - 29 * S), "Right-handed twist: 34.3°/bp → ~10.5 base pairs per full turn", font=F_TINY, fill=TEAL_DK, anchor="ma")
    elif step == 5:
        # Bold antiparallel polarity arrows on left & right of helix
        draw_arrow(d, (sx0 + 48 * S, sy1 - 76 * S), (sx0 + 48 * S, sy0 + 58 * S), TEAL, width=6, head=16)
        d.text((sx0 + 48 * S, sy0 + 40 * S), "3′", font=F_MONO, fill=TEAL_DK, anchor="ma")
        d.text((sx0 + 48 * S, sy1 - 70 * S), "5′", font=F_MONO, fill=TEAL_DK, anchor="ma")

        draw_arrow(d, (sx1 - 48 * S, sy0 + 58 * S), (sx1 - 48 * S, sy1 - 76 * S), AMBER, width=6, head=16)
        d.text((sx1 - 48 * S, sy0 + 40 * S), "5′", font=F_MONO, fill=AMBER, anchor="ma")
        d.text((sx1 - 48 * S, sy1 - 70 * S), "3′", font=F_MONO, fill=AMBER, anchor="ma")

        d.rounded_rectangle([sx0 + 72 * S, sy1 - 36 * S, sx1 - 72 * S, sy1 - 10 * S], radius=7 * S, fill=BG, outline=PURPLE, width=2)
        d.text((stage_cx, sy1 - 29 * S), "Antiparallel strands: 5′→3′ paired with 3′←5′", font=F_TINY, fill=PURPLE, anchor="ma")
    elif step == 6:
        # Major vs Minor groove brackets + docking TF α-helix!
        gx = sx0 + 24 * S
        # Major groove bracket (upper middle)
        d.line([(gx + 14 * S, 128 * S), (gx + 14 * S, 200 * S)], fill=BLUE, width=4)
        d.line([(gx + 8 * S, 128 * S), (gx + 22 * S, 128 * S)], fill=BLUE, width=3)
        d.line([(gx + 8 * S, 200 * S), (gx + 22 * S, 200 * S)], fill=BLUE, width=3)
        d.rounded_rectangle([gx, 151 * S, gx + 104 * S, 177 * S], radius=6 * S, fill=BLUE_BG, outline=BLUE, width=2)
        d.text((gx + 52 * S, 158 * S), "Major (~22 Å)", font=F_TINY, fill=BLUE, anchor="ma")

        # Minor groove bracket (lower)
        d.line([(gx + 14 * S, 228 * S), (gx + 14 * S, 268 * S)], fill=ROSE, width=4)
        d.line([(gx + 8 * S, 228 * S), (gx + 22 * S, 228 * S)], fill=ROSE, width=3)
        d.line([(gx + 8 * S, 268 * S), (gx + 22 * S, 268 * S)], fill=ROSE, width=3)
        d.rounded_rectangle([gx, 236 * S, gx + 104 * S, 262 * S], radius=6 * S, fill=ROSE_BG, outline=ROSE, width=2)
        d.text((gx + 52 * S, 243 * S), "Minor (~12 Å)", font=F_TINY, fill=ROSE, anchor="ma")

        # TF recognition α-helix gliding smoothly into Major Groove from right!
        if tf_dock > 0.02:
            tf_x = lerp(sx1 - 24 * S, stage_cx + 58 * S, tf_dock)
            tf_y = 166 * S
            d.rounded_rectangle([tf_x - 30 * S, tf_y - 20 * S, tf_x + 48 * S, tf_y + 20 * S],
                                radius=18 * S, fill=PURPLE_BG, outline=PURPLE, width=3)
            d.text((tf_x + 9 * S, tf_y - 12 * S), "TF α-helix", font=F_TINY, fill=PURPLE, anchor="ma")
            d.text((tf_x + 9 * S, tf_y + 1 * S), "reads groove!", font=F_TINY, fill=SOFT, anchor="ma")
            if tf_dock > 0.65:
                draw_arrow(d, (tf_x - 32 * S, tf_y), (stage_cx + 12 * S, tf_y), PURPLE, width=3, head=10)

        d.rounded_rectangle([sx0 + 18 * S, sy1 - 36 * S, sx1 - 18 * S, sy1 - 10 * S], radius=7 * S, fill=BLUE_BG, outline=BLUE, width=2)
        d.text((stage_cx, sy1 - 29 * S), "Major groove exposes base edges → TFs read DNA without opening it", font=F_TINY, fill=BLUE, anchor="ma")

    # --- Right Checklist Card (all 7 chemistry rules) ---
    rx0, ry0, rx1, ry1 = 480 * S, 64 * S, 738 * S, 422 * S
    d.rounded_rectangle([rx0, ry0, rx1, ry1], radius=12 * S, fill=PANEL, outline=RULE, width=2)
    d.text((rx0 + 14 * S, ry0 + 10 * S), "7 Forced Constraints", font=F_STEP_T, fill=TEAL_DK)

    for idx, (st_title, st_desc) in enumerate(STEPS):
        cy = ry0 + (34 + idx * 46) * S
        is_cur = idx == step
        is_done = idx < step
        box_fill = TEAL_BG if is_cur else (BG if is_done else PANEL)
        box_out = TEAL if is_cur else (RULE if is_done else (232, 238, 237))
        d.rounded_rectangle([rx0 + 10 * S, cy, rx1 - 10 * S, cy + 41 * S], radius=7 * S,
                            fill=box_fill, outline=box_out, width=3 if is_cur else 2)
        # Status dot / check
        dot_x, dot_y = rx0 + 23 * S, cy + 14 * S
        if is_done:
            d.ellipse([dot_x - 7 * S, dot_y - 7 * S, dot_x + 7 * S, dot_y + 7 * S], fill=TEAL)
            d.line([(dot_x - 3 * S, dot_y), (dot_x - 0.5 * S, dot_y + 3 * S), (dot_x + 4 * S, dot_y - 3 * S)], fill=BG, width=3)
        elif is_cur:
            d.ellipse([dot_x - 7 * S, dot_y - 7 * S, dot_x + 7 * S, dot_y + 7 * S], fill=AMBER)
            d.ellipse([dot_x - 2.5 * S, dot_y - 2.5 * S, dot_x + 2.5 * S, dot_y + 2.5 * S], fill=BG)
        else:
            d.ellipse([dot_x - 6 * S, dot_y - 6 * S, dot_x + 6 * S, dot_y + 6 * S], fill=BG, outline=RULE, width=2)

        t_col = TEAL_DK if is_cur else (INK if is_done else FAINT)
        d_col = INK if is_cur else (SOFT if is_done else (165, 178, 180))
        d.text((rx0 + 36 * S, cy + 5 * S), st_title, font=F_STEP_T, fill=t_col)
        d.text((rx0 + 36 * S, cy + 22 * S), st_desc, font=F_STEP_D, fill=d_col)

    # Anti-aliased 2x -> 1x Lanczos downsample
    return img.resize((W, H), Image.Resampling.LANCZOS)


def main():
    SCRATCH_PREVIEW.mkdir(parents=True, exist_ok=True)
    OUT_GIF.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="helix_gif_") as tmp:
        tmp_dir = Path(tmp)
        print(f"Rendering {TOTAL_FRAMES} frames ({TOTAL_SEC:.1f}s @ {FPS} fps) at 2x supersampling...")
        # Keyframe indices to inspect visually
        preview_frames = {
            int(1.8 * FPS): "step1_backbone.png",
            int(9.8 * FPS): "step4_pairing.png",
            int(13.2 * FPS): "step5_twist.png",
            int(20.2 * FPS): "step7_grooves.png",
        }
        for i in range(TOTAL_FRAMES):
            im = render_frame(i)
            fp = tmp_dir / f"f_{i:04d}.png"
            im.save(fp, format="PNG")
            if i in preview_frames:
                shutil.copy2(fp, SCRATCH_PREVIEW / preview_frames[i])

        pal = tmp_dir / "palette.png"
        subprocess.run([
            "ffmpeg", "-y", "-framerate", str(FPS), "-i", str(tmp_dir / "f_%04d.png"),
            "-vf", "palettegen=max_colors=128:stats_mode=diff", str(pal),
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        subprocess.run([
            "ffmpeg", "-y", "-framerate", str(FPS), "-i", str(tmp_dir / "f_%04d.png"),
            "-i", str(pal),
            "-lavfi", "paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle",
            str(OUT_GIF),
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    kb = OUT_GIF.stat().st_size / 1024
    print(f"Wrote {OUT_GIF} ({kb:.1f} KB)")


if __name__ == "__main__":
    main()
