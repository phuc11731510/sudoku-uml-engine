'use strict';
/* Xuất sơ đồ lớp thành ảnh tĩnh (SVG có chữ thật, nền trắng; PNG) để dán vào báo cáo. */
(function (U) {
  const { svgEl, plain } = U;

  const MONO = 'Consolas, "Cascadia Mono", "Courier New", monospace';
  const SANS = '"Segoe UI", Arial, Helvetica, sans-serif';

  function measurer() {
    const ctx = document.createElement('canvas').getContext('2d');
    return (font, text) => { ctx.font = font; return ctx.measureText(text).width; };
  }

  /* Ngắt một dòng chữ ký dài thành nhiều dòng, ưu tiên sau dấu «, » hoặc khoảng trắng. */
  function wrapSig(measure, font, text, maxW) {
    if (measure(font, text) <= maxW) return [text];
    const lines = [];
    let cur = '';
    const parts = text.split(/(?<=[, ])/);
    for (const p of parts) {
      const cand = cur + p;
      if (measure(font, cand) <= maxW || !cur) cur = cand;
      else { lines.push(cur.replace(/\s+$/, '')); cur = '    ' + p; }
    }
    if (cur) lines.push(cur.replace(/\s+$/, ''));
    return lines.map(l => {
      if (measure(font, l) <= maxW) return l;
      let s = l;
      while (s.length > 4 && measure(font, s + '...') > maxW) s = s.slice(0, -1);
      return s + '...';
    });
  }

  U.buildStaticSvg = function () {
    const D = U.D;
    const measure = measurer();
    const COLW = 560, GAP = 64, PAD = 70, ROW = 16;
    const FM = '12px ' + MONO;
    const visible = D.classes.filter(c => !U.S.hiddenPackages.has(c.package));

    // nội dung và chiều cao của từng thẻ
    const info = {};
    visible.forEach(c => {
      const attrs = (c.attributes || []).map(a => ({ lines: wrapSig(measure, FM, U.signature.attr(a), COLW - 28), a }));
      const methods = (c.methods || []).map(m => ({ lines: wrapSig(measure, FM, U.signature.methodFull(m), COLW - 28), m }));
      const values = (c.values || []).map(v => ({ lines: [v.name], v }));
      let h = 14 + 24 + 10;
      [attrs, methods, values].forEach(list => {
        if (list.length) h += 8 + list.reduce((s, r) => s + r.lines.length * ROW, 0);
      });
      info[c.id] = { attrs, methods, values, h };
    });

    const ids = visible.map(c => c.id);
    const size = {};
    const seed = {};
    ids.forEach((id, i) => { size[id] = { w: COLW, h: info[id].h }; seed[id] = D.byId[id].pos || [(i % 6) * 500, Math.floor(i / 6) * 500]; });
    const res = U.freeLayout(ids, size, seed, D.layoutRef, GAP, PAD, true);
    const rects = res.rects;
    const W = res.w, H = res.h;
    const rels = D.relations.filter(r => rects[r.from] && rects[r.to] && (U.S.showDeps || r.kind !== 'dependency'));
    const routes = U.routeAll(rects, rels);

    const svg = svgEl('svg', { xmlns: 'http://www.w3.org/2000/svg', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H });
    svg.append(svgEl('rect', { x: 0, y: 0, width: W, height: H, fill: '#ffffff' }));
    const defs = svgEl('defs');
    const mk = (id, vb, ref, body, fill) => svgEl('marker', {
      id, viewBox: vb, refX: ref[0], refY: ref[1], markerWidth: vb.split(' ')[2], markerHeight: vb.split(' ')[3],
      orient: 'auto', markerUnits: 'userSpaceOnUse', overflow: 'visible'
    }, svgEl('path', { d: body, fill, stroke: '#4b5563', 'stroke-width': 1.4 }));
    defs.append(
      mk('x-tri', '0 0 16 14', [16, 7], 'M0,0 L16,7 L0,14 Z', '#ffffff'),
      mk('x-diaF', '0 0 18 12', [0, 6], 'M0,6 L9,0 L18,6 L9,12 Z', '#4b5563'),
      mk('x-diaH', '0 0 18 12', [0, 6], 'M0,6 L9,0 L18,6 L9,12 Z', '#ffffff'),
      mk('x-open', '0 0 12 12', [12, 6], 'M1,1 L12,6 L1,11', 'none'));
    svg.append(defs);

    // đường nối nằm dưới thẻ
    const MAP = { inheritance: { end: 'x-tri' }, realization: { end: 'x-tri' }, composition: { start: 'x-diaF' }, aggregation: { start: 'x-diaH' }, association: { end: 'x-open' }, dependency: { end: 'x-open' } };
    routes.forEach(rt => {
      const k = rt.rel.kind;
      const p = svgEl('path', { d: rt.d, fill: 'none', stroke: '#4b5563', 'stroke-width': 1.4, 'stroke-dasharray': (k === 'realization' || k === 'dependency') ? '6 4' : null });
      if (MAP[k].start) p.setAttribute('marker-start', 'url(#' + MAP[k].start + ')');
      if (MAP[k].end) p.setAttribute('marker-end', 'url(#' + MAP[k].end + ')');
      svg.append(p);
    });

    // thẻ
    visible.forEach(c => {
      const r = rects[c.id], f = info[c.id];
      const color = D.pkgById[c.package].color;
      const g = svgEl('g');
      g.append(svgEl('rect', { x: r.x, y: r.y, width: r.w, height: r.h, rx: 7, fill: '#ffffff', stroke: '#6b7280', 'stroke-width': 1.2, 'stroke-dasharray': c.stereotype === 'types' ? '6 4' : null }));
      g.append(svgEl('rect', { x: r.x, y: r.y, width: 7, height: r.h, rx: 3, fill: color }));
      let y = r.y + 14;
      g.append(svgEl('text', { x: r.x + 16, y: y + 14, 'font-family': MONO, 'font-size': 16, 'font-weight': 700, fill: '#111827', 'font-style': (c.stereotype === 'abstract' || c.stereotype === 'interface') ? 'italic' : null }, c.id === 'BasicTypes' ? 'Kiểu cơ bản (BasicTypes)' : c.id));
      y += 24 + 10;
      [f.attrs, f.methods, f.values].forEach(list => {
        if (!list.length) return;
        g.append(svgEl('line', { x1: r.x + 7, y1: y, x2: r.x + r.w, y2: y, stroke: '#9ca3af', 'stroke-width': 1 }));
        y += 8;
        list.forEach(row => {
          const m = row.a || row.m || row.v;
          row.lines.forEach((ln, i) => {
            g.append(svgEl('text', {
              x: r.x + 16, y: y + 12, 'xml:space': 'preserve', 'font-family': MONO, 'font-size': 12, fill: '#111827',
              'text-decoration': (m.static && i === 0) ? 'underline' : null,
              'font-style': (m.abstract) ? 'italic' : null
            }, ln.replace(/^ +/, (s) => ' '.repeat(s.length))));
            y += ROW;
          });
        });
      });
      svg.append(g);
    });

    // nhãn và bội số vẽ trên cùng
    routes.forEach(rt => {
      const halo = { 'paint-order': 'stroke', stroke: '#ffffff', 'stroke-width': 4, 'stroke-linejoin': 'round' };
      if (rt.rel.label) svg.append(svgEl('text', Object.assign({ x: rt.label[0], y: rt.label[1] - 4, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 12, fill: '#111827' }, halo), plain(rt.rel.label)));
      if (rt.rel.fromMult) svg.append(svgEl('text', Object.assign({ x: rt.multA.x, y: rt.multA.y, 'text-anchor': rt.multA.anchor, 'font-family': SANS, 'font-size': 12, 'font-weight': 700, fill: '#1d4ed8' }, halo), rt.rel.fromMult));
      if (rt.rel.toMult) svg.append(svgEl('text', Object.assign({ x: rt.multB.x, y: rt.multB.y, 'text-anchor': rt.multB.anchor, 'font-family': SANS, 'font-size': 12, 'font-weight': 700, fill: '#1d4ed8' }, halo), rt.rel.toMult));
    });

    return { svg, width: W, height: H };
  };

  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  U.exportSvgText = function () {
    const { svg } = U.buildStaticSvg();
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svg);
  };

  U.exportSvg = function () {
    download(new Blob([U.exportSvgText()], { type: 'image/svg+xml;charset=utf-8' }), 'uml-engine-sudoku.svg');
  };

  U.exportPng = function () {
    const { svg, width, height } = U.buildStaticSvg();
    const text = new XMLSerializer().serializeToString(svg);
    const scale = Math.min(2, 7000 / width);
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = Math.round(width * scale);
      cv.height = Math.round(height * scale);
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      cv.toBlob((b) => { if (b) download(b, 'uml-engine-sudoku.png'); }, 'image/png');
    };
    img.onerror = () => { alert('Trình duyệt không vẽ được ảnh PNG từ SVG. Hãy dùng nút Tải SVG.'); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text);
  };

})(window.UML);
