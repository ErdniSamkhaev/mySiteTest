import { useEffect, useRef } from "react";
import { clamp, prefersReduced } from "../lib/env";
import { scrollState } from "../lib/scroll";

/**
 * Бабочка (в духе meermohsin): летит по траектории вслед за скроллом, машет
 * крыльями И **меняет форму по мере прокрутки** — от округлых крыльев вверху
 * до «трайбл»-шипастых внизу. Форма крыла генерируется параметрически, поэтому
 * морфинг плавный. Отключена при reduce-motion.
 */

/** Половина крыла (сторона side = ±1): параметрический контур от тела (0,0). */
function wingPath(side: number, len: number, spike: number, lobes: number): string {
  const N = 46;
  let d = "M0 0";
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const phi = ((-78 + 156 * u) * Math.PI) / 180; // от -78° (верх) до +78° (низ)
    // два «лепестка» крыла (верхний крупнее нижнего)
    const bump =
      Math.exp(-Math.pow((u - 0.26) / 0.17, 2)) * 1.0 +
      Math.exp(-Math.pow((u - 0.72) / 0.16, 2)) * 0.72;
    // шипы усиливаются с прокруткой → «трайбл»
    const sp = 1 + spike * Math.pow(Math.abs(Math.sin(u * Math.PI * lobes)), 1.6);
    const r = len * bump * sp + 4;
    const x = side * r * Math.cos(phi);
    const y = r * Math.sin(phi);
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d + " Z";
}

export default function Butterfly() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rRef = useRef<SVGPathElement | null>(null);
  const lRef = useRef<SVGPathElement | null>(null);
  const rGroup = useRef<SVGGElement | null>(null);
  const lGroup = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (prefersReduced()) return;
    const svg = svgRef.current;
    const rp = rRef.current;
    const lp = lRef.current;
    const rg = rGroup.current;
    const lg = lGroup.current;
    if (!svg || !rp || !lp || !rg || !lg) return;

    let raf = 0;
    const frame = (now: number) => {
      const p = clamp(scrollState.progress, 0, 1);

      // морфинг формы по прокрутке
      const len = 30 + p * 24; // крылья растут
      const spike = 0.1 + p * 0.95; // округлые → шипастые
      const lobes = 5 + p * 5; // больше «зубцов»
      rp.setAttribute("d", wingPath(1, len, spike, lobes));
      lp.setAttribute("d", wingPath(-1, len, spike, lobes));

      // мах крыльев (сжатие по X к телу)
      const flap = 0.22 + 0.78 * (0.5 + 0.5 * Math.sin(now * 0.012));
      rg.setAttribute("transform", `scale(${flap.toFixed(3)},1)`);
      lg.setAttribute("transform", `scale(${flap.toFixed(3)},1)`);

      // полёт: по вертикали за прогрессом, по горизонтали — синусоида
      const x = (0.5 + Math.sin(p * Math.PI * 3.0) * 0.34) * window.innerWidth;
      const y =
        (0.12 + p * 0.76) * window.innerHeight + Math.sin(now * 0.002) * 10;
      const dir = Math.cos(p * Math.PI * 3.0);
      // масштаб бабочки тоже слегка растёт к низу
      const s = 1.0 + p * 0.55;
      svg.style.transform = `translate(${x - 70}px, ${y - 70}px) rotate(${dir * 12}deg) scale(${s})`;

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg id="butterfly" ref={svgRef} viewBox="-90 -82 180 168" aria-hidden="true">
      <g ref={rGroup}>
        <path ref={rRef} fill="rgba(94,242,163,0.82)" />
      </g>
      <g ref={lGroup}>
        <path ref={lRef} fill="rgba(94,242,163,0.82)" />
      </g>
      <rect x="-2" y="-34" width="4" height="60" rx="2" fill="#0d1512" />
    </svg>
  );
}
