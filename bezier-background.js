/**
 * Bezier background: two intersecting curves divide viewport into 4 colored regions.
 * Geometry is parametrically tied to viewport size (W, H).
 *
 * Regions (mapped to --bezier-region-colors order):
 *   [0] top     — above both curves
 *   [1] rightEye — between curves, right of crossing
 *   [2] leftEye — between curves, left of crossing
 *   [3] bottom  — below both curves
 */
(function () {
  'use strict';

  function evalBezier(P0, P1, P2, P3, t) {
    var u = 1 - t, u2 = u * u, u3 = u2 * u;
    var t2 = t * t, t3 = t2 * t;
    return {
      x: u3 * P0.x + 3 * u2 * t * P1.x + 3 * u * t2 * P2.x + t3 * P3.x,
      y: u3 * P0.y + 3 * u2 * t * P1.y + 3 * u * t2 * P2.y + t3 * P3.y
    };
  }

  function findCurveIntersection(c1, c2) {
    var best = null, bestDist = 1e9;
    for (var i = 0; i <= 200; i++) {
      var t1 = i / 200;
      var p1 = evalBezier(c1[0], c1[1], c1[2], c1[3], t1);
      for (var j = 0; j <= 200; j++) {
        var t2 = j / 200;
        var p2 = evalBezier(c2[0], c2[1], c2[2], c2[3], t2);
        var d = (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
        if (d < bestDist) { bestDist = d; best = { t1: t1, t2: t2 }; }
      }
    }
    return best;
  }

  // Dh: height offset for endpoints
  // Curve 1: P0 at top-left corner, P3 offset 1/5 H up from bottom-right
  function getCurve1(p3y, W, Dh,amp) {
    var p0y = p3y - Dh;

    return [
      { x: 0, y: p0y },           // P0: top-left corner
      { x: 0.3 * W *amp, y: p0y },     // P1: same Y as P0, X pulled to center
      { x: W-(0.5 * W *amp), y: p3y },     // P2: same Y as P3, X pulled to center
      { x: W, y: p3y }             // P3: right edge, Dh up from bottom
    ];
  }

  // Curve 2: P0 offset 1/3 H up from bottom-left, P3 at top-right corner
  function getCurve2(p0y,W, Dh,amp) {
    var p3y = p0y - Dh;
    return [
      { x: 0, y: p0y },           // P0: left edge, Dh up from bottom
      { x: 0.3 * W *amp, y: p0y },     // P1: same Y as P0, X pulled to center
      { x: W-(0.5 * W *amp), y: p3y },     // P2: same Y as P3, X pulled to center
      { x: W, y: p3y }             // P3: top-right corner
    ];
  }

  function pt(p) { return p.x.toFixed(2) + ',' + p.y.toFixed(2); }

  function splitBezier(P0, P1, P2, P3, t) {
    var u = 1 - t;
    var q0 = { x: u * P0.x + t * P1.x, y: u * P0.y + t * P1.y };
    var q1 = { x: u * P1.x + t * P2.x, y: u * P1.y + t * P2.y };
    var q2 = { x: u * P2.x + t * P3.x, y: u * P2.y + t * P3.y };
    var r0 = { x: u * q0.x + t * q1.x, y: u * q0.y + t * q1.y };
    var r1 = { x: u * q1.x + t * q2.x, y: u * q1.y + t * q2.y };
    var s  = { x: u * r0.x + t * r1.x, y: u * r0.y + t * r1.y };
    return { left: [P0, q0, r0, s], right: [s, r1, q2, P3] };
  }

  function subCurveSVG(c, t0, t1) {
    if (t0 > t1) {
      c = [c[3], c[2], c[1], c[0]];
      t0 = 1 - t0;
      t1 = 1 - t1;
    }
    if (t0 === 0 && t1 === 1) {
      return ' C ' + pt(c[1]) + ' ' + pt(c[2]) + ' ' + pt(c[3]);
    }
    var right = splitBezier(c[0], c[1], c[2], c[3], t0).right;
    var t1n = (t1 - t0) / (1 - t0);
    var sub = splitBezier(right[0], right[1], right[2], right[3], t1n).left;
    return ' C ' + pt(sub[1]) + ' ' + pt(sub[2]) + ' ' + pt(sub[3]);
  }

  function render() {
    var W = window.innerWidth, H = window.innerHeight;
    var layout = getComputedStyle(document.documentElement).getPropertyValue('--layout').trim();
    var isPortrait = (layout === 'portrait');

    var styles = getComputedStyle(document.documentElement);
    var c1p3y = parseFloat(styles.getPropertyValue('--c1p3y-ratio')) * H;
    var Dh = parseFloat(styles.getPropertyValue('--dh-ratio')) * H;
    var headerH = parseFloat(styles.getPropertyValue('--header-h')) * H;

    var c2p0y, amp, imgW, imgH, imgY;
    if (isPortrait) {
      c2p0y = 0.78 * H;  amp = 0.8;
      imgW = W;            imgH = 0.8 * H;
      imgY = 0;
    } else {
      c2p0y = 4/5 * H;   amp = 0.9;
      imgW = W;           imgH = H;
      imgY = headerH;
    }

    var c1 = getCurve1(c1p3y, W, Dh,amp), c2 = getCurve2(c2p0y, W, Dh,amp);
    var ix = findCurveIntersection(c1, c2);
    var c1t = ix ? ix.t1 : 0.5;
    var c2t = ix ? ix.t2 : 0.5;
    var cross = evalBezier(c1[0], c1[1], c1[2], c1[3], c1t);

    // Endpoints
    var c1L = c1[0], c1R = c1[3]; // curve1: left=(0,0.15H)  right=(W,0.9H)
    var c2L = c2[0], c2R = c2[3]; // curve2: left=(0,0.85H)  right=(W,0.1H)

    // Top region: (0,0) → (W,0) → c2R → curve2 reversed to cross → curve1 reversed to c1L → (0,0)
    var top = 'M 0,0 L ' + W + ',0 L ' + pt(c2R)
      + subCurveSVG(c2, 1, c2t)
      + subCurveSVG(c1, c1t, 0)
      + ' L 0,0 Z';

    // Right eye: cross → curve2 to c2R → right edge → c1R → curve1 reversed to cross
    var rightEye = 'M ' + pt(cross)
      + subCurveSVG(c2, c2t, 1)
      + ' L ' + pt(c1R)
      + subCurveSVG(c1, 1, c1t)
      + ' Z';

    // Left eye: c1L → curve1 to cross → curve2 reversed to c2L → left edge → c1L
    var leftEye = 'M ' + pt(c1L)
      + subCurveSVG(c1, 0, c1t)
      + subCurveSVG(c2, c2t, 0)
      + ' L ' + pt(c1L) + ' Z';

    // Bottom region: (0,H) → c2L → curve2 to cross → curve1 to c1R → (W,H) → (0,H)
    var bottom = 'M 0,' + H + ' L ' + pt(c2L)
      + subCurveSVG(c2, 0, c2t)
      + subCurveSVG(c1, c1t, 1)
      + ' L ' + W + ',' + H + ' L 0,' + H + ' Z';

    var el = document.getElementById('bezier-bg');
    if (!el) return;

    var page = window.location.pathname.split('/').pop() || 'index.html';
    var paletteVar = '--bezier-bg-index';
    if (page === 'studio.html') paletteVar = '--bezier-bg-warm';
    else if (page === 'about.html') paletteVar = '--bezier-bg-cool';

    var colors = getComputedStyle(document.documentElement).getPropertyValue(paletteVar).trim();
    if (!colors) colors = '#ffffff #92CEDF #92CEDF #ffffff';
    var cols = colors.split(/\s+/);
    if (cols.length < 4) cols = ['#ffffff', '#92CEDF', '#92CEDF', '#ffffff'];

    var isIndex = (page === 'index.html' || page === '' || page === '/');
    var img1 = isIndex ? '<image href="images/bezier-bg-index-image2.png" x="' + (W - imgW) + '" y="' + imgY + '" width="' + imgW + '" height="' + imgH + '" preserveAspectRatio="xMaxYMin slice" style="mix-blend-mode:multiply"/>' : '';
    var img2 = isIndex ? '<image href="images/bezier-bg-index-image.png" x="' + (W - imgW) + '" y="' + imgY + '" width="' + imgW + '" height="' + imgH + '" preserveAspectRatio="xMaxYMin slice"/>' : '';

    el.innerHTML =
      '<svg width="' + W + '" height="' + H + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
      '<path d="' + top      + '" fill="' + cols[0] + '"/>' +
      '<path d="' + rightEye + '" fill="' + cols[1] + '"/>' +
      img1 +
      '<path d="' + leftEye  + '" fill="' + cols[2] + '"/>' +
      img2 +
      '<path d="' + bottom   + '" fill="' + cols[3] + '"/>' +
      '</svg>';
  }

  function init() {
    var el = document.getElementById('bezier-bg');
    if (!el) return;
    render();
    window.addEventListener('resize', render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
