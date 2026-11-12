/* =====================================================================
   script.js — draws the animated forest, the (clickable) footer animals, and builds
   the project lists from data.js. You shouldn't need to edit this file
   to add projects (edit data.js instead).

   Both pages run the same drawing code with the same random seed, so the
   forest is identical; only the "skin" changes:
     day   : morning redwoods, circuit traces, ATCG rain, butterflies, deer
     night : sunset lamp, stitch lines, fireflies, knit-stitch rain, moths, raccoon
   ===================================================================== */
(function () {
  "use strict";

  var mode = document.body.dataset.mode === "night" ? "night" : "day";
  var day = mode === "day";

  /* small helpers */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function f(n) { return Math.round(n * 10) / 10; }

  /* ------------------------------------------------------------------
     COLOURS for the drawings
     ------------------------------------------------------------------ */
  var C = day
    ? {
        sky0: "#dff3e6", sky1: "#fdfae4",
        far: "#cfe6d2", mid: "#a5d0aa",
        leaves: ["#5fae6a", "#4a9a5b", "#7cc481", "#3f8c52"],
        bark0: "#bd6b42", bark1: "#8a462c", barkLine: "#6f3722",
        ground0: "#8ccb86", ground1: "#4f9d58",
        trace: "#35d57c", traceOp: 0.6, pulse: "#b9ffd6", pulseGlow: "#12d066",
        rain: "#0b8a45", twig: "#6f3722",
      }
    : {
        sky0: "#120a16", sky1: "#2a1320",
        far: "#3a1c37", mid: "#241129",
        leaves: ["#1d0f22", "#2c1632", "#241229", "#351b3b"],
        bark0: "#40202e", bark1: "#190c15", barkLine: "#100710",
        ground0: "#211226", ground1: "#110915",
        trace: "#ff9a62", traceOp: 0.55, pulse: "#ffe3c9", pulseGlow: "#ff6fa8",
        rain: "#ff8db5", twig: "#100710", firefly: "#ffd27a",
      };

  /* ------------------------------------------------------------------
     BACKGROUND SCENE
     ------------------------------------------------------------------ */
  function conifer(R, x, base, h, w) {
    var tiers = 7 + Math.floor(R() * 3), top = base - h, pts = [], i;
    for (i = 1; i <= tiers; i++) {
      var t = i / tiers;
      pts.push([(w / 2) * Math.pow(t, 0.8) * (0.8 + R() * 0.35), top + t * h * 0.9]);
    }
    var d = "M" + f(x) + " " + f(top);
    for (i = 0; i < pts.length; i++) d += "L" + f(x + pts[i][0]) + " " + f(pts[i][1]) + "L" + f(x + pts[i][0] * 0.5) + " " + f(pts[i][1] - 4);
    d += "L" + f(x + w * 0.05) + " " + base + "L" + f(x - w * 0.05) + " " + base;
    for (i = pts.length - 1; i >= 0; i--) d += "L" + f(x - pts[i][0] * 0.5) + " " + f(pts[i][1] - 4) + "L" + f(x - pts[i][0]) + " " + f(pts[i][1]);
    return d + "Z";
  }

  function trunk(R, x, w, id) {
    var s = '<rect x="' + x + '" y="-20" width="' + w + '" height="1040" fill="url(#' + id + ')"/>';
    for (var i = 1; i < 6; i++) {
      var gx = x + (w * i) / 6 + (R() - 0.5) * 8, d = "M" + f(gx) + " -20";
      for (var y = 80; y <= 1020; y += 110) d += "Q" + f(gx + (R() - 0.5) * 16) + " " + (y - 55) + " " + f(gx + (R() - 0.5) * 6) + " " + y;
      s += '<path d="' + d + '" fill="none" stroke="' + C.barkLine + '" stroke-width="' + f(1.5 + R() * 2) + '" opacity="0.5"/>';
    }
    return s;
  }

  /* fireflies (night only) */
  function firefly(R, x, y) {
    var style = "--dx:" + f((R() - 0.5) * 140) + "px;--dy:" + f((R() - 0.5) * 110) + "px;--rot:0deg;--dur:" + f(11 + R() * 14) + "s;--delay:-" + f(R() * 20) + "s";
    var r = f(2.2 + R() * 2.2);
    return '<g transform="translate(' + f(x) + " " + f(y) + ')"><g class="floaty" style="' + style + '"><circle r="' + r * 4 + '" fill="' + C.firefly + '" opacity="0.14"/>' +
      '<circle class="twinkle" style="--delay:-' + f(R() * 3) + 's" r="' + r + '" fill="' + C.firefly + '"/></g></g>';
  }

  /* one redwood bough: a drooping stem with feathery sprays along it.
     dir = 1 grows to the right, -1 to the left. */
  function bough(R, x0, y0, len, dir, droop, shade) {
    var x1 = x0 + dir * len * 0.5, y1 = y0 - len * 0.12, x2 = x0 + dir * len, y2 = y0 + droop;
    var n = Math.max(9, Math.round(len / 9)), leaves = "", i;
    function spray(px, py, a, L, col) {
      var c = Math.cos(a), sn = Math.sin(a), qx = px + L * c, qy = py + L * sn, mx = (px + qx) / 2, my = (py + qy) / 2, w = L * 0.17;
      return '<path d="M' + f(px) + " " + f(py) + "Q" + f(mx - sn * w) + " " + f(my + c * w) + " " + f(qx) + " " + f(qy) + "Q" + f(mx + sn * w) + " " + f(my - c * w) + " " + f(px) + " " + f(py) + 'Z" fill="' + col + '"/>';
    }
    for (i = 1; i <= n; i++) {
      var t = i / n, u = 1 - t;
      var px = u * u * x0 + 2 * u * t * x1 + t * t * x2, py = u * u * y0 + 2 * u * t * y1 + t * t * y2;
      var L = (24 + len * 0.13) * (1 - 0.45 * t) * (0.8 + R() * 0.4);
      leaves += spray(px, py, -Math.PI / 2 + dir * (1.0 + (R() - 0.5) * 0.3), L * 0.6, C.leaves[(shade + 1) % 4]);
      leaves += spray(px, py, Math.PI / 2 - dir * (0.55 + (R() - 0.5) * 0.3), L, C.leaves[(shade + i) % 4]);
    }
    leaves += spray(x2, y2, Math.atan2(y2 - y1, x2 - x1), 26 + len * 0.08, C.leaves[shade % 4]);
    return leaves + '<path d="M' + f(x0) + " " + f(y0) + "Q" + f(x1) + " " + f(y1) + " " + f(x2) + " " + f(y2) + '" fill="none" stroke="' + C.twig + '" stroke-width="' + f(2.5 + len / 70) + '" stroke-linecap="round" opacity="0.8"/>';
  }

  function buildScene() {
    var R = rng(11), s = "", i;
    s += '<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>' +
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.sky0 + '"/><stop offset="1" stop-color="' + C.sky1 + '"/></linearGradient>' +
      '<linearGradient id="barkL" x1="0" x2="1"><stop offset="0" stop-color="' + C.bark1 + '"/><stop offset="1" stop-color="' + C.bark0 + '"/></linearGradient>' +
      '<linearGradient id="barkR" x1="0" x2="1"><stop offset="0" stop-color="' + C.bark0 + '"/><stop offset="1" stop-color="' + C.bark1 + '"/></linearGradient>' +
      '<linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.ground0 + '"/><stop offset="1" stop-color="' + C.ground1 + '"/></linearGradient>' +
      (day
        ? '<radialGradient id="sun"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="0.25" stop-color="#fff6c4" stop-opacity="0.95"/><stop offset="1" stop-color="#fff0a8" stop-opacity="0"/></radialGradient>'
        : '<radialGradient id="lamp"><stop offset="0" stop-color="#ffd884"/><stop offset="0.42" stop-color="#ff9d4f"/><stop offset="0.74" stop-color="#ff5f7e"/><stop offset="1" stop-color="#d9479c"/></radialGradient>' +
          '<radialGradient id="halo"><stop offset="0.3" stop-color="#ff6a86" stop-opacity="0.6"/><stop offset="0.65" stop-color="#ff5f9a" stop-opacity="0.22"/><stop offset="1" stop-color="#ff5f9a" stop-opacity="0"/></radialGradient>') +
      "</defs>";
    s += '<rect width="1600" height="1000" fill="url(#sky)"/>';

    /* sun (day) / sunset lamp (night), same spot in the sky */
    if (day) {
      s += '<circle cx="1080" cy="130" r="470" fill="url(#sun)"/><g class="rays" fill="#fffbe0">' +
        '<polygon points="1080,130 300,1000 520,1000" opacity="0.38"/><polygon points="1080,130 640,1000 790,1000" opacity="0.3"/>' +
        '<polygon points="1080,130 900,1000 1010,1000" opacity="0.34"/><polygon points="1080,130 1130,1000 1290,1000" opacity="0.26"/>' +
        '<polygon points="1080,130 0,640 0,820" opacity="0.28"/></g>';
    } else {
      s += '<circle class="breathe" cx="1080" cy="250" r="620" fill="url(#halo)"/><circle cx="1080" cy="250" r="215" fill="url(#lamp)"/>';
      for (i = 0; i < 46; i++) s += '<circle class="twinkle" style="--delay:-' + f(R() * 4) + 's" cx="' + f(R() * 1600) + '" cy="' + f(R() * 420) + '" r="' + f(0.8 + R() * 1.3) + '" fill="#ffe9d6"/>';
    }

    /* "matrix rain": DNA bases by day, knit stitches by night */
    var cols = [330, 430, 560, 700, 900, 1230, 1310], letters = day ? "ATCG" : "vvvv";
    s += '<g font-family="JetBrains Mono, ui-monospace, monospace" font-size="19" font-weight="700" fill="' + C.rain + '" text-anchor="middle">';
    cols.forEach(function (cx, ci) {
      var off = R() * 5;
      for (var j = 0; j < 13; j++) s += '<text class="rain" style="--delay:-' + f(5 - ((off + j * 0.22) % 5)) + 's" x="' + cx + '" y="' + (50 + j * 34 + (ci % 2) * 14) + '">' + letters[Math.floor(R() * 4)] + "</text>";
    });
    s += "</g>";

    /* far + mid trees */
    for (i = 0; i < 17; i++) s += '<path d="' + conifer(R, 60 + i * 95 + R() * 50, 860, 360 + R() * 230, 110 + R() * 40) + '" fill="' + C.far + '" opacity="' + (day ? 0.85 : 0.9) + '"/>';
    for (i = 0; i < 10; i++) s += '<path d="' + conifer(R, 120 + i * 150 + R() * 70, 930, 520 + R() * 260, 150 + R() * 50) + '" fill="' + C.mid + '" opacity="' + (day ? 0.9 : 0.96) + '"/>';

    /* ground */
    s += '<path d="M0 905C220 880 420 925 640 900S1080 880 1280 905S1500 890 1600 900V1000H0Z" fill="url(#gnd)"/>';

    /* big redwood trunks framing the page */
    s += trunk(R, 185, 100, "barkL") + trunk(R, 5, 150, "barkL") + trunk(R, 1325, 100, "barkR") + trunk(R, 1450, 150, "barkR");

    /* circuit traces (day) / running stitches (night) */
    var traces = [
      "M70 1000V820l28-28V600l-34-34V380l30-30V140l-24-24V-10",
      "M118 1000V905l20-20V690",
      "M238 1000V760l-24-24V520l30-30V300",
      "M1532 1000V800l-28-28V560l34-34V330l-30-30V120l22-22V-10",
      "M1378 1000V780l26-26V540l-28-28V280",
      "M1488 1000V900l-20-20V705",
      "M290 962H520l30-30H760l28 28H1010l30-30H1320",
      "M420 986H680l22-22H930l24 24H1210",
    ];
    var pads = [[138, 690], [244, 300], [1376, 280], [1468, 705], [290, 962], [1320, 962], [420, 986], [1210, 986], [98, 792], [64, 566], [94, 350], [1504, 772], [1538, 534], [1508, 300], [214, 736], [1404, 754]];
    traces.forEach(function (d, ti) {
      s += '<path d="' + d + '" fill="none" stroke="' + C.trace + '" stroke-width="' + (day ? 3 : 3.2) + '" stroke-linecap="round" stroke-linejoin="round" opacity="' + C.traceOp + '"' + (day ? "" : ' stroke-dasharray="11 9"') + "/>";
      var st = ' style="--dur:' + f(4.5 + R() * 5) + "s;--delay:-" + f(R() * 8) + 's"';
      s += '<path class="trace-pulse"' + st + ' d="' + d + '" pathLength="100" fill="none" stroke="' + C.pulseGlow + '" stroke-width="9" stroke-linecap="round" opacity="0.45"/>' +
        '<path class="trace-pulse"' + st + ' d="' + d + '" pathLength="100" fill="none" stroke="' + C.pulse + '" stroke-width="3.2" stroke-linecap="round"/>';
    });
    pads.forEach(function (p) {
      var dl = ' style="--delay:-' + f(R() * 2.4) + 's"';
      if (day) s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="6.5" fill="' + C.bark1 + '" stroke="' + C.trace + '" stroke-width="2.5"/><circle class="led"' + dl + ' cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="' + C.pulse + '"/>';
      else s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="8" fill="' + C.bark1 + '" stroke="' + C.trace + '" stroke-width="2"/><g class="led"' + dl + ' fill="' + C.pulse + '"><circle cx="' + (p[0] - 2.6) + '" cy="' + p[1] + '" r="1.5"/><circle cx="' + (p[0] + 2.6) + '" cy="' + p[1] + '" r="1.5"/></g>';
    });
    /* redwood boughs hanging off the big trunks */
    [[185, 285, 1], [5, 155, 1], [1325, 1425, -1], [1450, 1600, -1]].forEach(function (t, ti) {
      var inner = t[2] === 1 ? t[1] : t[0], outer = t[2] === 1 ? t[0] : t[1];
      for (var b = 0; b < 6; b++) {
        var by = 14 + b * 56 + R() * 26;
        s += bough(R, inner - t[2] * 10, by, 200 + R() * 140 - b * 14, t[2], 50 + R() * 60, b + ti);
        if (b % 2 === 0) s += bough(R, outer + t[2] * 10, by + 30, 110 + R() * 70, -t[2], 40 + R() * 40, b + ti + 2);
      }
    });

    /* fireflies at night (the daytime page has nothing floating) */
    if (!day) for (i = 0; i < 26; i++) {
      var zone = i % 3, fx = zone === 0 ? 20 + R() * 300 : zone === 1 ? 1290 + R() * 290 : 330 + R() * 940;
      s += firefly(R, fx, 90 + R() * 780);
    }
    return s + "</svg>";
  }

  /* ------------------------------------------------------------------
     FOOTER SCENE: deer (day) / raccoon in a trash can (night)
     ------------------------------------------------------------------ */
  /* a little cluster of mushrooms; (x, y) is where the biggest one meets the ground */
  var CAPS = day ? ["#e2574c", "#e98a3c", "#c9713f", "#d9455f"] : ["#ff6fa8", "#ff9a62", "#c58bff", "#ff8db5"];
  function mushroom(x, y, k, col) {
    var w = 11 * k, h = 15 * k;
    return (day ? "" : '<circle cx="' + f(x) + '" cy="' + f(y - h) + '" r="' + f(w * 1.9) + '" fill="' + col + '" opacity="0.13"/>') +
      '<path d="M' + f(x - w * 0.24) + " " + f(y + 2) + "L" + f(x - w * 0.18) + " " + f(y - h) + "H" + f(x + w * 0.18) + "L" + f(x + w * 0.24) + " " + f(y + 2) + 'Z" fill="#f6e9d8"/>' +
      '<path d="M' + f(x - w) + " " + f(y - h + 1) + "C" + f(x - w) + " " + f(y - h - w * 1.25) + " " + f(x + w) + " " + f(y - h - w * 1.25) + " " + f(x + w) + " " + f(y - h + 1) + "Q" + f(x) + " " + f(y - h + w * 0.35) + " " + f(x - w) + " " + f(y - h + 1) + 'Z" fill="' + col + '"/>' +
      '<circle cx="' + f(x - w * 0.4) + '" cy="' + f(y - h - w * 0.35) + '" r="' + f(w * 0.15) + '" fill="#fff" opacity="0.9"/><circle cx="' + f(x + w * 0.3) + '" cy="' + f(y - h - w * 0.5) + '" r="' + f(w * 0.12) + '" fill="#fff" opacity="0.9"/><circle cx="' + f(x + w * 0.05) + '" cy="' + f(y - h - w * 0.12) + '" r="' + f(w * 0.1) + '" fill="#fff" opacity="0.9"/>';
  }
  function mushrooms(R, x, y) {
    var n = 2 + Math.floor(R() * 2), s = "", i;
    for (i = n - 1; i >= 0; i--) s += mushroom(x + (i === 0 ? 0 : (i % 2 ? -1 : 1) * (9 + R() * 6) * i), y + (i ? 1 : 0), i === 0 ? 0.85 + R() * 0.35 : 0.45 + R() * 0.25, CAPS[Math.floor(R() * 4)]);
    return s;
  }

  /* the two grassy hills of the footer, and the blades growing along their top edge */
  function hillBack(x) { return 186 + 12 * Math.sin(x / 190 + 0.6) + 4 * Math.sin(x / 67); }
  function hillFront(x) { return 222 + 6 * Math.sin(x / 140) + 3 * Math.sin(x / 53 + 1); }
  function hillPath(fn, col) {
    var d = "M-20 260L-20 " + f(fn(-20));
    for (var x = 0; x <= 1220; x += 20) d += "L" + x + " " + f(fn(x));
    return '<path d="' + d + 'L1220 260Z" fill="' + col + '"/>';
  }
  function grass(R, fn, cols, hMin, hMax) {
    var s = "";
    for (var x = -10; x < 1210; x += 3.5 + R() * 3.5) {
      var y = fn(x) + 2.5, h = hMin + R() * (hMax - hMin), lean = (R() - 0.5) * h * 0.9, w = 1.8 + R() * 1.2;
      s += '<path d="M' + f(x - w) + " " + f(y) + "Q" + f(x - w * 0.4 + lean * 0.25) + " " + f(y - h * 0.6) + " " + f(x + lean) + " " + f(y - h) + "Q" + f(x + w * 0.6 + lean * 0.35) + " " + f(y - h * 0.5) + " " + f(x + w) + " " + f(y) + 'Z" fill="' + cols[Math.floor(R() * cols.length)] + '"/>';
    }
    return s;
  }

  function leg(x, y, h, w, col, hoof, cls) {
    return '<g transform="translate(' + x + " " + y + ')"><g class="' + cls + '"><rect x="' + -w / 2 + '" y="-2" width="' + w + '" height="' + h + '" rx="' + w / 2.2 + '" fill="' + col + '"/>' +
      '<rect x="' + -w / 2 + '" y="' + (h - 9) + '" width="' + w + '" height="7" rx="2" fill="' + hoof + '"/></g></g>';
  }

  function deer() {
    var body = "#c98b5e", dark = "#a06a44", cream = "#f8e6d0", nose = "#3a2a22";
    return '<g transform="translate(640 219)"><g class="deer" role="button" tabindex="0" aria-label="Fawn. Click to make it gallop."><g class="deer-run"><g class="deer-bounce">' +
      '<rect x="-62" y="-172" width="170" height="176" fill="transparent"/>' +
      leg(-25.5, -50, 52, 9, dark, nose, "leg leg-b2") + leg(38.5, -50, 52, 9, dark, nose, "leg leg-f2") +
      '<g transform="translate(-46 -72)"><g class="deer-tail"><ellipse cx="-7" cy="-3" rx="10" ry="6.5" transform="rotate(-35)" fill="' + body + '"/><ellipse cx="-9" cy="-1" rx="6" ry="4" transform="rotate(-35)" fill="' + cream + '"/></g></g>' +
      '<ellipse cx="0" cy="-62" rx="50" ry="26" fill="' + body + '"/><ellipse cx="3" cy="-51" rx="34" ry="12" fill="' + cream + '" opacity="0.9"/>' +
      '<g fill="' + cream + '"><circle cx="-26" cy="-77" r="3"/><circle cx="-11" cy="-81" r="2.6"/><circle cx="-33" cy="-66" r="2.6"/><circle cx="-17" cy="-69" r="2.4"/><circle cx="3" cy="-78" r="2.8"/><circle cx="-1" cy="-68" r="2"/></g>' +
      leg(-38, -52, 54, 10, body, nose, "leg leg-b") + leg(27, -52, 54, 10, body, nose, "leg leg-f") +
      /* neck + head pivot at the shoulder */
      '<g transform="translate(36 -70)"><g class="deer-neck">' +
      '<path d="M-12 -4L14 12L36 -38L16 -46Z" fill="' + body + '" stroke="' + body + '" stroke-width="7" stroke-linejoin="round"/>' +
      '<g transform="translate(16 -68)"><g class="deer-ear"><ellipse cx="-2" cy="-10" rx="7" ry="15" transform="rotate(-28)" fill="' + dark + '"/></g></g>' +
      '<ellipse cx="30" cy="-52" rx="19" ry="16" fill="' + body + '"/>' +
      '<ellipse cx="46" cy="-46" rx="12.5" ry="9.5" fill="' + cream + '"/><ellipse cx="56" cy="-48" rx="4.2" ry="3.4" fill="' + nose + '"/>' +
      '<ellipse cx="37" cy="-43" rx="5" ry="3" fill="#f2a7a0" opacity="0.6"/>' +
      '<g class="blink"><circle cx="34" cy="-55" r="3.6" fill="' + nose + '"/><circle cx="35.2" cy="-56.3" r="1.2" fill="#fff"/></g>' +
      '<g transform="translate(24 -66)"><g class="deer-ear"><ellipse cx="0" cy="-12" rx="7.5" ry="16" transform="rotate(-8)" fill="' + body + '"/><ellipse cx="0.5" cy="-11" rx="3.6" ry="10" transform="rotate(-8)" fill="#f2b9a8"/></g></g>' +
      "</g></g></g></g></g></g>";
  }

  function raccoon() {
    var fur = "#a9a2bd", dk = "#3a3247", lt = "#f3eef7";
    return '<g transform="translate(640 221)"><g class="coon" role="button" tabindex="0" aria-label="Trash can. Click to see who is inside.">' +
      '<rect x="-58" y="-166" width="140" height="170" fill="transparent"/>' +
      '<g transform="translate(30 -14)"><g class="coon-tail"><path d="M0 0C42 4 60 -26 44 -54" fill="none" stroke="' + fur + '" stroke-width="19" stroke-linecap="round"/><path d="M0 0C42 4 60 -26 44 -54" fill="none" stroke="' + dk + '" stroke-width="19" stroke-dasharray="9 12" stroke-dashoffset="-6"/></g></g>' +
      '<g class="coon-pop"><g class="coon-head">' +
      '<circle cx="-27" cy="-135" r="11.5" fill="' + fur + '"/><circle cx="27" cy="-135" r="11.5" fill="' + fur + '"/><circle cx="-27" cy="-135" r="6" fill="' + dk + '"/><circle cx="27" cy="-135" r="6" fill="' + dk + '"/>' +
      '<ellipse cx="0" cy="-112" rx="37" ry="28" fill="' + fur + '"/>' +
      '<ellipse cx="-15" cy="-127" rx="10" ry="4" transform="rotate(-14 -15 -127)" fill="' + lt + '"/><ellipse cx="15" cy="-127" rx="10" ry="4" transform="rotate(14 15 -127)" fill="' + lt + '"/>' +
      '<ellipse cx="-16" cy="-115" rx="15" ry="10.5" transform="rotate(18 -16 -115)" fill="' + dk + '"/><ellipse cx="16" cy="-115" rx="15" ry="10.5" transform="rotate(-18 16 -115)" fill="' + dk + '"/>' +
      '<ellipse cx="0" cy="-101" rx="15" ry="11" fill="' + lt + '"/>' +
      '<g class="blink"><circle cx="-14" cy="-115" r="5.4" fill="#fff6d8"/><circle cx="14" cy="-115" r="5.4" fill="#fff6d8"/><circle cx="-13" cy="-114.5" r="3" fill="#1c1622"/><circle cx="15" cy="-114.5" r="3" fill="#1c1622"/><circle cx="-12" cy="-116" r="1" fill="#fff"/><circle cx="16" cy="-116" r="1" fill="#fff"/></g>' +
      '<ellipse cx="0" cy="-105.5" rx="5.2" ry="3.8" fill="#1c1622"/><path d="M-4.5 -98.5Q0 -94.5 4.5 -98.5" fill="none" stroke="#1c1622" stroke-width="1.6" stroke-linecap="round"/>' +
      /* the lid it wears as a hat */
      '<g transform="rotate(-7 0 -142)"><path d="M-9 -150q9 -13 18 0" fill="none" stroke="#b9b2c9" stroke-width="4" stroke-linecap="round"/><path d="M-50 -142q50 -16 100 0Z" fill="#9a93ad"/><ellipse cx="0" cy="-141" rx="51" ry="7.5" fill="#847d97"/></g>' +
      "</g></g>" +
      /* the can, drawn in front so the raccoon pops up from inside */
      '<rect x="-42" y="-100" width="84" height="100" rx="7" fill="#655e77"/><rect x="-42" y="-100" width="20" height="100" rx="7" fill="#7b748d" opacity="0.7"/>' +
      '<g stroke="#4a4459" stroke-width="3" stroke-linecap="round"><path d="M-20 -86V-10M0 -86V-10M20 -86V-10"/></g>' +
      '<rect x="-46" y="-105" width="92" height="11" rx="5.5" fill="#8a839d"/><rect x="-44" y="-14" width="88" height="6" rx="3" fill="#4a4459"/>' +
      '<g class="coon-paws" fill="' + dk + '"><ellipse cx="-24" cy="-104" rx="8.5" ry="6"/><ellipse cx="24" cy="-104" rx="8.5" ry="6"/></g>' +
      "</g></g>";
  }

  function buildFooterScene() {
    var R = rng(5), s = "", i;
    var wood = day ? "#b9794e" : "#4b2a38", woodDk = day ? "#8a5636" : "#2c1722";
    var backCol = day ? "#7cc07c" : "#1c1021", frontCol = day ? "#2c6a3c" : "#110915";
    var backBlades = day ? ["#7cc07c", "#8fd08c", "#69b56f", "#9bd896"] : ["#1c1021", "#27142d", "#2f1936"];
    var frontBlades = day ? ["#2c6a3c", "#357a46", "#3f8f52", "#2c6a3c"] : ["#110915", "#1c0f21", "#24132a", "#110915"];
    s += '<svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
      (day ? "A fawn grazing in the morning forest" : "A trash can at dusk with a raccoon hiding inside") + '">';
    /* back hill, little trees standing on it, grass along its edge */
    for (i = 0; i < 9; i++) { var tx = 40 + i * 140 + R() * 60; s += '<path d="' + conifer(R, tx, f(hillBack(tx) + 8), 70 + R() * 70, 46 + R() * 16) + '" fill="' + (day ? "#58a765" : "#241229") + '"/>'; }
    s += hillPath(hillBack, backCol) + grass(R, hillBack, backBlades, 6, 13);
    /* stump */
    s += '<rect x="772" y="188" width="46" height="36" rx="4" fill="' + woodDk + '"/><ellipse cx="795" cy="189" rx="24" ry="7" fill="' + wood + '"/><ellipse cx="795" cy="189" rx="13" ry="3.5" fill="none" stroke="' + woodDk + '" stroke-width="1.5"/>';
    /* mushrooms on the back hill */
    [60, 200, 330, 470, 920, 1050, 1150].forEach(function (x) { s += mushrooms(R, x + R() * 30, hillBack(x) + 14 + R() * 12); });
    /* front ground: same colour as the footer block underneath */
    s += hillPath(hillFront, frontCol);
    s += day ? deer() : raccoon();
    s += mushrooms(R, 838, hillFront(838) + 1) + mushrooms(R, 545, hillFront(545) + 2) + mushrooms(R, 250, hillFront(250) + 2) + mushrooms(R, 1040, hillFront(1040) + 2);
    s += grass(R, hillFront, frontBlades, 7, 17);
    return s + "</svg>";
  }

  /* ------------------------------------------------------------------
     BUTTERFLIES (day) / MOTHS (night)
     They stay at the bottom of the page: from the top of the last box
     down to the end of the footer. Each one drifts round a smooth loop.
     ------------------------------------------------------------------ */
  function buildFlyers() {
    var last = document.querySelector("main > section:last-of-type");
    if (!last) return;
    var R = rng(day ? 21 : 34), n = day ? 6 : 4, css = "", html = "", TAU = Math.PI * 2;
    var looks = day
      ? [["#ffc93c", "#ff9f1c", "#5a3a22"], ["#ff8552", "#ffd166", "#5a3a22"], ["#8fd3ff", "#e8f7ff", "#35506b"], ["#ffffff", "#ffe6a7", "#6b5a3a"]]
      : [["#f3e9ff", "#d6bcff", "#8a769c"], ["#fff0dc", "#ffc9a3", "#9c7d76"]];
    for (var b = 0; b < n; b++) {
      /* a gentle looping path, in % of the butterfly area */
      var cx = 18 + R() * 64, cy = 25 + R() * 50, ax = 10 + R() * 14, ay = 10 + R() * 12, bx = 3 + R() * 5, by = 3 + R() * 5, p1 = R() * TAU, p2 = R() * TAU, dirn = R() < 0.5 ? 1 : -1;
      var pos = function (t) { return [cx + ax * Math.sin(dirn * t + p1) + bx * Math.sin(2 * t + p2), cy + ay * Math.cos(dirn * t + p1) + by * Math.sin(3 * t + p1)]; };
      var steps = 36, i;
      css += "@keyframes fly" + b + "{";
      for (i = 0; i <= steps; i++) {
        var t = (i / steps) * TAU, p = pos(t), q = pos(t + 0.05), dx = q[0] - p[0], dy = q[1] - p[1];
        var tilt = (18 * dx) / (Math.sqrt(dx * dx + dy * dy) || 1); /* lean a little into the direction of travel */
        css += f((i / steps) * 100) + "%{transform:translate(" + f(p[0]) + "cqw," + f(p[1]) + "cqh) rotate(" + f(tilt) + "deg)}";
      }
      css += "}";
      var c = looks[b % looks.length];
      var wing = '<g class="wing"><path d="M-1 -1C-5 -15 -19 -15 -18 -5C-17.5 1 -8 2 -1 1Z" fill="' + c[0] + '"/><path d="M-1 1C-8 2 -15 5 -12 11C-9 15 -3 10 -1 4Z" fill="' + c[1] + '"/>' +
        '<circle cx="-12" cy="-7" r="1.8" fill="' + c[1] + '"/><circle cx="-8.5" cy="8" r="1.4" fill="' + c[0] + '"/></g>';
      html += '<div class="bfly" style="animation:fly' + b + " " + f(38 + R() * 26) + "s linear -" + f(R() * 60) + 's infinite"><svg viewBox="-20 -17 40 34" style="animation-delay:-' + f(R() * 2) + 's">' +
        wing + '<g transform="scale(-1 1)">' + wing + "</g>" +
        '<path d="M0 -6Q-2 -11 -4.5 -12.5M0 -6Q2 -11 4.5 -12.5" fill="none" stroke="' + c[2] + '" stroke-width="0.9" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="1.5" ry="6.5" fill="' + c[2] + '"/></svg></div>';
    }
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var layer = document.createElement("div"); layer.className = "flyers"; layer.setAttribute("aria-hidden", "true"); layer.innerHTML = html;
    document.body.appendChild(layer);

    /* keep the area lined up with the last box + footer, whatever the page height is */
    function place() {
      var top = last.getBoundingClientRect().top + window.scrollY;
      layer.style.top = Math.round(top) + "px";
      layer.style.height = Math.max(0, Math.round(document.documentElement.scrollHeight - top)) + "px";
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("load", place);
    if (window.ResizeObserver) new ResizeObserver(place).observe(document.querySelector("main"));
  }

  /* ------------------------------------------------------------------
     PROJECT LISTS (from data.js)
     ------------------------------------------------------------------ */
  var PH_ICON = '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="22" cy="24" r="15"/><path d="M10 17c8 2 18 9 22 18M8 26c7 0 16 5 20 12M15 11c8 3 17 11 20 21M35 33c4 3 6 6 9 7"/></svg>';

  function placeholder(path) {
    return '<div class="ph">' + PH_ICON + "<span>photo goes here</span>" + (path ? "<code>" + esc(path) + "</code>" : "<span>set <code>image</code> in data.js</span>") + "</div>";
  }

  function renderWork(el) {
    var list = typeof WORK_PROJECTS !== "undefined" ? WORK_PROJECTS : [];
    el.innerHTML = list.map(function (p, i) {
      var id = "P-" + String(list.length - i).padStart(2, "0");
      var title = p.link ? '<a href="' + esc(p.link) + '" target="_blank" rel="noopener">' + esc(p.title) + "</a>" : esc(p.title);
      return '<article class="proj">' +
        (p.image ? '<div class="proj-img"><img src="' + esc(p.image) + '" alt="" loading="lazy" style="--focus:' + esc(p.focus || "center") + '"></div>' : "") +
        '<div class="proj-body"><span class="proj-id">' + id + "</span><h3>" + title + "</h3>" +
        (p.blurb ? "<p>" + esc(p.blurb) + "</p>" : "") +
        (p.extra ? '<a class="more" href="' + esc(p.extra.url) + '" target="_blank" rel="noopener">' + esc(p.extra.label) + "</a>" : "") +
        (p.tags && p.tags.length ? '<ul class="chips">' + p.tags.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" : "") +
        "</div></article>";
    }).join("");
    el.querySelectorAll(".proj-img img").forEach(function (img) {
      img.addEventListener("error", function () { img.parentNode.remove(); });
    });
  }

  function renderCrafts(el) {
    var list = typeof CRAFT_PROJECTS !== "undefined" ? CRAFT_PROJECTS : [];
    var cats = [];
    list.forEach(function (p) { if (cats.indexOf(p.category) < 0) cats.push(p.category); });
    var counts = {};
    list.forEach(function (p) { counts[p.status] = (counts[p.status] || 0) + 1; });
    var tally = ["finished", "in progress", "planned"].filter(function (k) { return counts[k]; }).map(function (k) { return counts[k] + " " + k; }).join(" · ");

    var html = '<div class="filters" role="group" aria-label="Filter by craft"><button type="button" data-cat="" aria-pressed="true">all</button>' +
      cats.map(function (c) { return '<button type="button" data-cat="' + esc(c) + '" aria-pressed="false">' + esc(c) + "</button>"; }).join("") +
      '</div><p class="tally">' + list.length + " crafts logged" + (tally ? " — " + tally : "") + '</p><div class="gallery">';
    html += list.map(function (p) {
      var shape = p.shape === "tall" || p.shape === "wide" ? " tile--" + p.shape : "";
      var st = p.status ? '<span class="status status--' + esc(p.status.replace(/\s+/g, "-")) + '">' + esc(p.status) + "</span>" : "";
      var media = p.image
        ? '<button type="button" class="tile-media" data-full="' + esc(p.full || p.image) + '" data-title="' + esc(p.title) + '" aria-label="Enlarge photo: ' + esc(p.title) + '"><img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy" style="--focus:' + esc(p.focus || "center") + '"></button>'
        : placeholder("");
      return '<figure class="tile' + shape + '" data-cat="' + esc(p.category) + '">' + media +
        "<figcaption>" + st + "<strong>" + esc(p.title) + "</strong>" + (p.note ? '<span class="note">' + esc(p.note) + "</span>" : "") + "</figcaption></figure>";
    }).join("") + "</div>";
    el.innerHTML = html;

    /* a missing photo file falls back to the placeholder, showing the path it expected */
    el.querySelectorAll(".tile-media img").forEach(function (img) {
      img.addEventListener("error", function () {
        var btn = img.parentNode;
        btn.outerHTML = placeholder(img.getAttribute("src"));
      });
    });

    el.querySelector(".filters").addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      el.querySelectorAll(".filters button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      el.querySelectorAll(".tile").forEach(function (t) { t.hidden = !!b.dataset.cat && t.dataset.cat !== b.dataset.cat; });
    });

    /* click a photo to see it whole */
    var dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.innerHTML = '<img alt=""><p></p><button type="button">close</button>';
    document.body.appendChild(dlg);
    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.tagName === "BUTTON") dlg.close(); });
    el.addEventListener("click", function (e) {
      var b = e.target.closest(".tile-media[data-full]");
      if (!b || !dlg.showModal) return;
      dlg.querySelector("img").src = b.dataset.full;
      dlg.querySelector("img").alt = b.dataset.title;
      dlg.querySelector("p").textContent = b.dataset.title;
      dlg.showModal();
    });
  }

  function renderNotes(el) {
    var list = typeof FIELD_NOTES !== "undefined" ? FIELD_NOTES : [];
    el.innerHTML = list.map(function (n) {
      var t = n.link ? '<a href="' + esc(n.link) + '" target="_blank" rel="noopener">' + esc(n.title) + "</a>" : esc(n.title);
      return '<article class="note-card"><span class="where">@ ' + esc(n.where) + "</span><h3>" + t + "</h3><p>" + esc(n.text) + "</p></article>";
    }).join("");
  }

  /* ------------------------------------------------------------------
     GO
     ------------------------------------------------------------------ */
  var scene = document.querySelector(".scene");
  if (scene) scene.innerHTML = buildScene();
  var fs = document.querySelector(".footer-scene");
  if (fs) {
    fs.innerHTML = buildFooterScene();

    /* click (or Enter / Space) the animals */
    var press = function (el, fn) {
      if (!el) return;
      el.addEventListener("click", fn);
      el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } });
    };
    var deerEl = fs.querySelector(".deer");
    press(deerEl, function () { deerEl.classList.add("galloping"); });
    if (deerEl) deerEl.addEventListener("animationend", function (e) { if (e.animationName === "deer-run") deerEl.classList.remove("galloping"); });

    var coonEl = fs.querySelector(".coon"), coonTimer;
    press(coonEl, function () {
      clearTimeout(coonTimer);
      if (coonEl.classList.toggle("out")) coonTimer = setTimeout(function () { coonEl.classList.remove("out"); }, 6000);
    });
  }

  buildFlyers();

  var w = document.getElementById("work-projects"); if (w) renderWork(w);
  var c = document.getElementById("craft-projects"); if (c) renderCrafts(c);
  var n = document.getElementById("field-notes"); if (n) renderNotes(n);

  /* profile photo: if the file is missing, show a placeholder instead of a broken image */
  document.querySelectorAll(".frame img").forEach(function (img) {
    function swap() { img.parentNode.innerHTML = placeholder(img.getAttribute("src")); }
    if (img.complete && img.naturalWidth === 0) swap(); else img.addEventListener("error", swap);
  });
})();
