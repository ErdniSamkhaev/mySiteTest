import { useEffect, useRef } from "react";
import { prefersReduced } from "../lib/env";

/** Плёночное зерно поверх сцены (screen-blend). Отключено при reduce-motion. */
export default function Grain() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (prefersReduced()) return;
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const size = 140;
    c.width = size;
    c.height = size;
    c.style.width = "100vw";
    c.style.height = "100vh";
    c.style.imageRendering = "pixelated";

    let raf = 0;
    let n = 0;
    const draw = () => {
      n++;
      if (n % 3 === 0) {
        const img = ctx.createImageData(size, size);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const v = (Math.random() * 255) | 0;
          d[i] = d[i + 1] = d[i + 2] = v;
          d[i + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas id="grain" ref={ref} aria-hidden="true" />;
}
