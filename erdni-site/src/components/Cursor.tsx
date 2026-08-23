import { useEffect, useRef } from "react";
import { isFinePointer, lerp } from "../lib/env";

/**
 * Кастомный курсор в духе lucerra.co: тонкое кольцо (SVG) плавно следует за
 * указателем с запаздыванием и лёгким наклоном в сторону движения. Над
 * интерактивными элементами кольцо увеличивается и вокруг него крутится
 * дуга-«загрузка».
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isFinePointer()) return;
    const wrap = ref.current!;

    let mx = window.innerWidth / 2,
      my = window.innerHeight / 2;
    let rx = mx,
      ry = my,
      px = mx,
      py = my;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const frame = () => {
      rx = lerp(rx, mx, 0.2);
      ry = lerp(ry, my, 0.2);
      // лёгкий наклон в направлении движения (как inner-offset у lucerra)
      const vx = rx - px,
        vy = ry - py;
      px = rx;
      py = ry;
      const lean = Math.min(Math.hypot(vx, vy), 40) * 0.16;
      const ang = Math.atan2(vy, vx);
      const ox = Math.cos(ang) * lean;
      const oy = Math.sin(ang) * lean;
      wrap.style.transform = `translate(${rx + ox}px, ${ry + oy}px)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const hot = document.querySelectorAll<HTMLElement>(
      "a, button, input, textarea, [data-magnet], .entry, .channel, .sound-btn",
    );
    const cleanups: Array<() => void> = [];
    hot.forEach((el) => {
      const on = () => wrap.classList.add("hot");
      const off = () => wrap.classList.remove("hot");
      el.addEventListener("pointerenter", on);
      el.addEventListener("pointerleave", off);
      cleanups.push(() => {
        el.removeEventListener("pointerenter", on);
        el.removeEventListener("pointerleave", off);
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div className="cur" ref={ref} aria-hidden="true">
      <svg className="cur-svg" viewBox="0 0 100 100">
        <circle className="ring" cx="50" cy="50" r="34" />
        <circle className="arc" cx="50" cy="50" r="34" />
      </svg>
    </div>
  );
}
