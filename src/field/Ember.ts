/**
 * A small particle field: nodes drifting in three depth planes, joined by
 * proximity edges, nudged away from the pointer, with technology labels that
 * surface when the pointer comes close. Runs only while its canvas is on screen.
 * Used inside the dive scene, where the camera lands after zooming through the panel.
 */
type P = { x: number; y: number; vx: number; vy: number; hx: number; hy: number; z: number; seed: number; label?: string };

const TAU = Math.PI * 2;

export class Ember {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private ps: P[] = [];
  private raf = 0;
  private t = 0;
  private last = 0;
  private visible = false;
  private pointer = { x: -9999, y: -9999, on: false };
  private ro: ResizeObserver;
  private io: IntersectionObserver;

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: { count: number; labels?: string[]; color: string; edge: string; label: string; animate: boolean },
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas unavailable');
    this.ctx = ctx;
    let s = 9;
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    this.ps = Array.from({ length: opts.count }, (_, i) => ({
      x: 0, y: 0, vx: 0, vy: 0, hx: rand(), hy: rand(), z: [0.35, 0.65, 1][i % 3], seed: rand() * TAU,
      label: opts.labels && i < opts.labels.length ? opts.labels[i] : undefined,
    }));
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      if (this.visible && this.opts.animate) this.start();
    });
    this.io.observe(canvas);
    canvas.addEventListener('pointermove', this.onMove);
    canvas.addEventListener('pointerleave', this.onLeave);
    this.resize();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.io.disconnect();
    this.canvas.removeEventListener('pointermove', this.onMove);
    this.canvas.removeEventListener('pointerleave', this.onLeave);
  }

  private onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = this.canvas.getBoundingClientRect();
    this.pointer = { x: e.clientX - r.left, y: e.clientY - r.top, on: true };
  };

  private onLeave = () => { this.pointer.on = false; };

  private resize() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = r.width;
    this.h = r.height;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const p of this.ps) { p.x = p.hx * this.w; p.y = p.hy * this.h; }
    this.draw();
  }

  private start() {
    cancelAnimationFrame(this.raf);
    this.last = 0;
    const tick = (now: number) => {
      if (!this.visible) return;
      const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 1 / 60;
      this.last = now;
      this.t += dt;
      this.step(dt);
      this.draw();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  private step(dt: number) {
    const k = dt * 60;
    for (const p of this.ps) {
      const drift = 14 + 22 * p.z;
      const tx = p.hx * this.w + Math.sin(this.t * 0.2 + p.seed) * drift;
      const ty = p.hy * this.h + Math.cos(this.t * 0.17 + p.seed) * drift;
      if (this.pointer.on) {
        const dx = p.x - this.pointer.x;
        const dy = p.y - this.pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < 130 && d > 1) {
          const f = (1 - d / 130) * 1.3 * p.z;
          p.vx += (dx / d) * f * k;
          p.vy += (dy / d) * f * k;
        }
      }
      p.vx += (tx - p.x) * 0.02 * k;
      p.vy += (ty - p.y) * 0.02 * k;
      const damp = Math.pow(0.82, k);
      p.vx *= damp;
      p.vy *= damp;
      p.x += p.vx * k;
      p.y += p.vy * k;
    }
  }

  private draw() {
    const { ctx, ps } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    const reach = Math.min(150, this.w * 0.12);
    ctx.lineWidth = 1;
    for (let i = 0; i < ps.length; i++) {
      for (let j = i + 1; j < ps.length; j++) {
        const a = ps[i];
        const b = ps[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > reach) continue;
        ctx.strokeStyle = `rgba(${this.opts.edge},${((1 - d / reach) * 0.3 * Math.min(a.z, b.z)).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    if (this.pointer.on) {
      const near = ps.map((p) => ({ p, d: Math.hypot(p.x - this.pointer.x, p.y - this.pointer.y) })).filter((o) => o.d < 220).sort((a, b) => a.d - b.d).slice(0, 4);
      for (const { p, d } of near) {
        ctx.strokeStyle = `rgba(${this.opts.edge},${(0.6 * (1 - d / 220)).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(this.pointer.x, this.pointer.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }
    ctx.font = '500 12px "Archivo Variable", system-ui, sans-serif';
    for (const p of ps) {
      ctx.globalAlpha = 0.3 + p.z * 0.6;
      ctx.fillStyle = this.opts.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1 + p.z * 2.2, 0, TAU);
      ctx.fill();
      if (p.label && this.pointer.on) {
        const d = Math.hypot(p.x - this.pointer.x, p.y - this.pointer.y);
        if (d < 180) {
          ctx.globalAlpha = 1 - d / 180;
          ctx.fillStyle = this.opts.label;
          ctx.fillText(p.label, p.x + 9, p.y + 4);
        }
      }
    }
    ctx.globalAlpha = 1;
  }
}
