import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * A fixed, full-viewport background "grid world" for the landing page.
 * Layers (back → front):
 *   1. Drifting fine grid (CSS, theme-aware via html.light)
 *   2. Constellation of nodes + dashed connection lines (STATIC svg)
 *   3. Flowing links + twinkling nodes (LIVE svg — the only animated svg)
 *   4. Soft radial light source that follows the cursor
 *   5. Drifting wide grid on top, masked toward the edges
 *
 * Performance: continuously animating things either run on the compositor
 * (transform-based grid drift, see index.css) or live in the small LIVE svg,
 * so the large constellation paints once and is never repainted per frame.
 * Cursor updates are coalesced to one style write per animation frame.
 *
 * Lives at z-index -1 behind all page content; pointer-events are disabled.
 */
const NODE_TILE = 112; // constellation spacing (independent of the CSS grid)
const LINK_RADIUS = 132; // max distance for a connection

const hash = (n) => {
  let h = n * 374761393;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 0xffffffff;
};

const buildGraph = (cols, rows) => {
  const nodes = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Slightly offset each node so the grid feels organic, not ruler-straight
      const ox = (hash(r * 13 + c) - 0.5) * 22;
      const oy = (hash(r * 7 + c + 99) - 0.5) * 22;
      nodes.push({
        id: `${r}-${c}`,
        c,
        r,
        x: c * NODE_TILE + NODE_TILE / 2 + ox,
        y: r * NODE_TILE + NODE_TILE / 2 + oy,
        size: 1.6 + hash(r * 3 + c * 11) * 1.8,
        // Only a small fraction animates — the rest render once in the static svg
        twinkle: hash(r * 31 + c * 7) < 0.1,
        delay: hash(r + c * 17) * 6,
        duration: 3 + hash(r * 5 + c) * 4,
      });
    }
  }

  // Connect each node to a subset of its nearest grid neighbors — O(n),
  // no pairwise scan, and the mesh stays airy instead of fully meshed.
  const at = (c, r) => (c < 0 || r < 0 || c >= cols || r >= rows ? null : nodes[r * cols + c]);
  const links = [];
  for (const n of nodes) {
    const steps = [[1, 0], [1, 1], [0, 1]];
    for (let k = 0; k < steps.length; k++) {
      const m = at(n.c + steps[k][0], n.r + steps[k][1]);
      if (!m) continue;
      const d = Math.hypot(n.x - m.x, n.y - m.y);
      if (d > LINK_RADIUS) continue;
      if (hash(n.r * 101 + n.c * 17 + k * 53) < 0.34) continue;
      links.push({ a: n, b: m, d, flow: hash(links.length * 29 + 7) < 0.1 });
    }
  }
  return { nodes, links };
};

const nodeGradient = (id) => (
  <radialGradient id={id} cx="50%" cy="50%" r="50%">
    <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
    <stop offset="40%" stopColor="currentColor" stopOpacity="0.9" />
    <stop offset="60%" stopColor="currentColor" stopOpacity="0.3" />
    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
  </radialGradient>
);

const GridBackdrop = () => {
  const cursorRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    let frame = null;
    const update = () => {
      // Show a bit beyond the viewport so scrolling never reveals a gap
      const w = window.innerWidth + 200;
      const h = window.innerHeight + 400;
      if (frame !== null) return; // coalesce resize bursts into one render
      frame = requestAnimationFrame(() => {
        frame = null;
        setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  // Cursor-tracked radial light. The container is fixed at inset 0, so client
  // coords map 1:1 (no rect lookup) and writes are coalesced to one per frame.
  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;
    let x = 0;
    let y = 0;
    let frame = null;
    const apply = () => {
      frame = null;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
    };
    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (frame === null) frame = requestAnimationFrame(apply);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  const cols = Math.ceil(size.w / NODE_TILE) + 1;
  const rows = Math.ceil(size.h / NODE_TILE) + 1;

  const { nodes, links } = useMemo(() => buildGraph(cols, rows), [cols, rows]);
  const staticNodes = useMemo(() => nodes.filter((n) => !n.twinkle), [nodes]);
  const liveNodes = useMemo(() => nodes.filter((n) => n.twinkle), [nodes]);
  const staticLinks = useMemo(() => links.filter((l) => !l.flow), [links]);
  const flowLinks = useMemo(() => links.filter((l) => l.flow), [links]);

  const linkOpacity = (d) => Math.max(0.08, 1 - d / LINK_RADIUS) * 0.35;

  return (
    <div
      aria-hidden="true"
      className="grid-world fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }}
    >
      {/* 1. Drifting fine grid (theme-aware, composited transform drift) */}
      <div className="absolute inset-0 grid-animated-fine opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)]" />

      {/* 2. Constellation — fully static, paints once */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox={`0 0 ${size.w} ${size.h}`}
      >
        <defs>{nodeGradient('gw-node')}</defs>
        <g className="gw-links">
          {staticLinks.map((l, i) => (
            <line
              key={i}
              x1={l.a.x}
              y1={l.a.y}
              x2={l.b.x}
              y2={l.b.y}
              stroke="currentColor"
              strokeWidth="0.6"
              strokeOpacity={linkOpacity(l.d)}
              strokeDasharray="3 6"
            />
          ))}
        </g>
        <g>
          {staticNodes.map((n) => (
            <circle key={n.id} cx={n.x} cy={n.y} r={n.size * 2.4} fill="url(#gw-node)" />
          ))}
        </g>
      </svg>

      {/* 3. Flowing links + twinkling nodes — kept in its own small svg so the
             per-frame paint never touches the big static constellation above */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox={`0 0 ${size.w} ${size.h}`}
      >
        <defs>{nodeGradient('gw-node-live')}</defs>
        <g className="gw-links">
          {flowLinks.map((l, i) => (
            <line
              key={i}
              x1={l.a.x}
              y1={l.a.y}
              x2={l.b.x}
              y2={l.b.y}
              stroke="currentColor"
              strokeWidth="0.6"
              strokeOpacity={linkOpacity(l.d)}
              strokeDasharray="3 6"
              style={{ animation: `gw-flow ${4 + (i % 5)}s linear infinite`, animationDelay: `${(i % 7) * 0.4}s` }}
            />
          ))}
        </g>
        <g>
          {liveNodes.map((n) => (
            <circle
              key={n.id}
              cx={n.x}
              cy={n.y}
              r={n.size * 2.4}
              fill="url(#gw-node-live)"
              style={{
                transformOrigin: `${n.x}px ${n.y}px`,
                animation: `gw-twinkle ${n.duration}s ease-in-out infinite`,
                animationDelay: `${n.delay}s`,
              }}
            />
          ))}
        </g>
      </svg>

      {/* 4. Cursor-following radial light */}
      <div ref={cursorRef} className="absolute inset-0 gw-cursor" style={{ '--mx': '50%', '--my': '30%' }} />

      {/* 5. Drifting wide grid overlay (theme-aware, drifts against the fine one) */}
      <div className="absolute inset-0 grid-animated-wide grid-drift-reverse opacity-25 [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_70%)]" />

      {/* 6. Vignette to fade edges into the page background */}
      <div className="absolute inset-0 gw-vignette" />
    </div>
  );
};

export default GridBackdrop;
