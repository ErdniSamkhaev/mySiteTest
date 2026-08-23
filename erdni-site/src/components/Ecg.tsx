import { useEffect, useRef } from "react";
import { prefersReduced } from "../lib/env";

/** ЭКГ-разделитель: анимированный QRS-комплекс — мотив «пульса/сигнала». */
export default function Ecg({ phase = 0 }: { phase?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0,
      h = 0;
    const resize = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const beat = (x: number) => {
      if (x < 0.15) return Math.sin((x / 0.15) * Math.PI) * 0.06;
      if (x < 0.22) return 0;
      if (x < 0.26) return (-(x - 0.22) / 0.04) * 0.18;
      if (x < 0.3) return -0.18 + ((x - 0.26) / 0.04) * 1.15;
      if (x < 0.34) return 0.97 - ((x - 0.3) / 0.04) * 1.25;
      if (x < 0.38) return -0.28 + ((x - 0.34) / 0.04) * 0.28;
      if (x < 0.55) return 0;
      if (x < 0.72) return Math.sin(((x - 0.55) / 0.17) * Math.PI) * 0.12;
      return 0;
    };

    const reduced = prefersReduced();
    const speed = reduced ? 0 : 0.18;
    let t = phase;
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const mid = h * 0.5;
      const amp = h * 0.42;
      const cycles = Math.max(2, Math.round(w / 260));
      ctx.beginPath();
      for (let px = 0; px <= w; px += 2) {
        const u = (px / w) * cycles + t;
        const frac = u - Math.floor(u);
        const y = mid - beat(frac) * amp;
        if (px === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.strokeStyle = "rgba(94,242,163,0.55)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(94,242,163,0.7)";
      ctx.shadowBlur = 8;
      ctx.stroke();
      t -= speed * 0.01;
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [phase]);

  return <canvas className="ecg" ref={ref} aria-hidden="true" />;
}
