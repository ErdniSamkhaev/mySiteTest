import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { prefersReduced } from "./env";

/**
 * Общее состояние скролла — компоненты читают его в своих rAF-циклах
 * (без ре-рендеров React). Обновляется либо Lenis, либо нативным скроллом
 * при prefers-reduced-motion.
 */
export const scrollState = { y: 0, max: 1, progress: 0 };

let lenis: Lenis | null = null;

function recalc(y: number, max: number) {
  scrollState.y = y;
  scrollState.max = Math.max(1, max);
  scrollState.progress = y / Math.max(1, max);
}

export function initScroll(): () => void {
  const nativeUpdate = () => {
    recalc(
      window.scrollY,
      document.documentElement.scrollHeight - window.innerHeight,
    );
  };

  if (prefersReduced()) {
    window.addEventListener("scroll", nativeUpdate, { passive: true });
    window.addEventListener("resize", nativeUpdate);
    nativeUpdate();
    return () => {
      window.removeEventListener("scroll", nativeUpdate);
      window.removeEventListener("resize", nativeUpdate);
    };
  }

  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on("scroll", (inst: Lenis) => {
    recalc(inst.scroll, inst.limit);
  });

  let raf = 0;
  const loop = (time: number) => {
    lenis?.raf(time);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  nativeUpdate();

  return () => {
    cancelAnimationFrame(raf);
    lenis?.destroy();
    lenis = null;
  };
}

export function scrollTo(target: string | number | HTMLElement): void {
  if (lenis) {
    lenis.scrollTo(target as string | number | HTMLElement, { duration: 1.3 });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
  } else {
    const el =
      typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: "smooth" });
  }
}
