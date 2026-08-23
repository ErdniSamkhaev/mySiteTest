import { useEffect, useRef } from "react";
import { scrollState } from "../lib/scroll";

/**
 * Интерактивное облако частиц (в духе lucerra). Несколько «скоплений»
 * привязаны к секциям (#hero и #contact) и едут со скроллом вместе с ними.
 * Курсор расталкивает точки — там, где прошла мышь, всё «рассыпается» и затем
 * медленно собирается обратно. Сырой WebGL, физика на CPU.
 */

// Скопления: селектор секции-якоря + доля центра внутри неё + радиус (доля min(vw,vh)).
// По одному на каждую секцию — облако присутствует по всей странице, стороны чередуются.
const CLUSTERS = [
  { sel: "#hero", cxf: 0.66, cyf: 0.46, rf: 0.24, ell: 0.9 },
  { sel: "#about", cxf: 0.3, cyf: 0.5, rf: 0.19, ell: 0.95 },
  { sel: "#services", cxf: 0.74, cyf: 0.5, rf: 0.19, ell: 0.95 },
  { sel: "#bloom", cxf: 0.5, cyf: 0.5, rf: 0.22, ell: 1.0 },
  { sel: "#contact", cxf: 0.5, cyf: 0.52, rf: 0.24, ell: 0.95 },
];

export default function SceneCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // общий бюджет точек делим между всеми скоплениями (≈9500 на десктопе)
    const NC = CLUSTERS.length;
    const PER = lowPower ? 700 : 1900;
    const COUNT = PER * NC;

    let vw = window.innerWidth || 1280;
    let vh = window.innerHeight || 800;
    const resize = () => {
      vw = window.innerWidth || 1280;
      vh = window.innerHeight || 800;
      canvas.width = Math.floor(vw * dpr);
      canvas.height = Math.floor(vh * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // центр/радиус каждого скопления в CSS-пикселях (пересчёт каждый кадр от секции)
    const ccx = new Float32Array(NC);
    const ccy = new Float32Array(NC);
    const cR = new Float32Array(NC);
    const updateCenters = () => {
      for (let k = 0; k < NC; k++) {
        const el = document.querySelector(CLUSTERS[k].sel) as HTMLElement | null;
        const base = Math.min(vw, vh);
        if (el) {
          const r = el.getBoundingClientRect();
          ccx[k] = r.left + r.width * CLUSTERS[k].cxf;
          ccy[k] = r.top + r.height * CLUSTERS[k].cyf;
        } else {
          ccx[k] = vw * CLUSTERS[k].cxf;
          ccy[k] = vh * CLUSTERS[k].cyf;
        }
        cR[k] = base * CLUSTERS[k].rf;
      }
    };
    updateCenters();

    // --- частицы ---
    const ci = new Uint8Array(COUNT); // индекс скопления
    const ca0 = new Float32Array(COUNT);
    const sa0 = new Float32Array(COUNT);
    const rr = new Float32Array(COUNT);
    const zz = new Float32Array(COUNT);
    const ph = new Float32Array(COUNT);
    const px = new Float32Array(COUNT);
    const py = new Float32Array(COUNT);
    const vx = new Float32Array(COUNT);
    const vy = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const k = (i / PER) | 0;
      ci[i] = k;
      const a = Math.random() * Math.PI * 2;
      ca0[i] = Math.cos(a);
      sa0[i] = Math.sin(a);
      rr[i] = Math.pow(Math.random(), 0.62);
      zz[i] = Math.random() * 2 - 1;
      ph[i] = Math.random() * Math.PI * 2;
      const r = rr[i] * cR[k];
      px[i] = ccx[k] + ca0[i] * r;
      py[i] = ccy[k] + sa0[i] * r * CLUSTERS[k].ell;
    }

    const data = new Float32Array(COUNT * 4);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);

    const vsrc = `
      attribute vec4 aData;
      varying float vB;
      void main(){
        gl_Position = vec4(aData.x, aData.y, 0.0, 1.0);
        gl_PointSize = aData.z;
        vB = aData.w;
      }`;
    const fsrc = `
      precision mediump float;
      varying float vB;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d);
        vec3 green = vec3(0.30, 0.85, 0.55);
        vec3 white = vec3(0.85, 1.0, 0.92);
        vec3 col = mix(green, white, clamp(vB, 0.0, 1.0));
        gl_FragColor = vec4(col, a * (0.30 + clamp(vB,0.0,1.0) * 0.70));
      }`;
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, vsrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsrc);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);
    const aData = gl.getAttribLocation(prog, "aData");
    gl.enableVertexAttribArray(aData);
    gl.vertexAttribPointer(aData, 4, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.clearColor(0, 0, 0, 0);

    const mouse = { x: -9999, y: -9999, sp: 0 };
    let lastMx = -9999,
      lastMy = -9999;
    const onMove = (e: PointerEvent) => {
      if (lastMx > -9000) {
        mouse.sp = Math.min(
          Math.hypot(e.clientX - lastMx, e.clientY - lastMy),
          90,
        );
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      lastMx = e.clientX;
      lastMy = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const INF = lowPower ? 120 : 160;
    const INF2 = INF * INF;
    const spring = reduced ? 0.03 : 0.014;
    const damping = 0.9;
    const ambient = reduced ? 0 : 1;

    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      updateCenters();
      mouse.sp *= 0.92;
      const rot = t * 0.05;
      const cosR = Math.cos(rot),
        sinR = Math.sin(rot);

      for (let i = 0; i < COUNT; i++) {
        const k = ci[i];
        const r = rr[i] * cR[k];
        const ell = CLUSTERS[k].ell;
        const bx = ca0[i] * r,
          by = sa0[i] * r * ell;
        let hx = ccx[k] + bx * cosR - by * sinR;
        let hy = ccy[k] + bx * sinR + by * cosR;
        if (ambient) {
          const amp = 6 * (0.4 + zz[i] * 0.3);
          hx += Math.sin(t * 0.6 + ph[i]) * amp;
          hy += Math.cos(t * 0.5 + ph[i]) * amp;
        }

        let ax = (hx - px[i]) * spring;
        let ay = (hy - py[i]) * spring;

        const dx = px[i] - mouse.x;
        const dy = py[i] - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < INF2) {
          const d = Math.sqrt(d2) + 0.0001;
          const f = (1 - d / INF) * (2.2 + mouse.sp * 0.16);
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }

        const nvx = (vx[i] + ax) * damping;
        const nvy = (vy[i] + ay) * damping;
        vx[i] = nvx;
        vy[i] = nvy;
        px[i] += nvx;
        py[i] += nvy;

        const off = Math.hypot(px[i] - hx, py[i] - hy);
        const bright = Math.min(off / 90 + Math.hypot(nvx, nvy) * 0.05, 1);

        const j = i * 4;
        data[j] = (px[i] / vw) * 2 - 1;
        data[j + 1] = 1 - (py[i] / vh) * 2;
        data[j + 2] = (1.1 + (zz[i] * 0.5 + 0.5) * 1.8 + bright * 1.6) * dpr;
        data[j + 3] = 0.18 + bright * 0.82;
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, COUNT);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return <canvas id="webgl" ref={ref} aria-hidden="true" />;
}
