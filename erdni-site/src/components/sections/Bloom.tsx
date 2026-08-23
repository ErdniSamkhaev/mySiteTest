import { useEffect, useMemo, useRef } from "react";
import { clamp } from "../../lib/env";

type Petal = { d: string; rot: number; fill: string; opacity: number; layer: number };

const LAYERS = [
  { n: 8, len: 82, w: 32, c: "#2f7a56", o: 0.9 },
  { n: 8, len: 62, w: 25, c: "#5ef2a3", o: 0.95 },
  { n: 6, len: 42, w: 19, c: "#a9ffd2", o: 1 },
];

/**
 * Цветок раскрывается и закрывается, привязанно к скроллу (в духе saffron).
 * Секция высокая, а сам цветок закреплён по центру (sticky) на весь проход,
 * поэтому раскрытие хорошо видно: прокрутка вниз — раскрывается, вверх —
 * складывается обратно. Прогресс = сколько прокручено внутри закреплённой секции.
 */
export default function Bloom() {
  const secRef = useRef<HTMLElement | null>(null);
  const pathRefs = useRef<Array<SVGPathElement | null>>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const progRef = useRef<HTMLSpanElement | null>(null);

  const petals = useMemo<Petal[]>(() => {
    const out: Petal[] = [];
    LAYERS.forEach((L, li) => {
      for (let i = 0; i < L.n; i++) {
        out.push({
          d: `M0 0 C ${L.w} -${L.len * 0.4}, ${L.w * 0.5} -${L.len}, 0 -${L.len} C -${L.w * 0.5} -${L.len}, -${L.w} -${L.len * 0.4}, 0 0 Z`,
          rot: (360 / L.n) * i + li * 12,
          fill: L.c,
          opacity: L.o,
          layer: li,
        });
      }
    });
    return out;
  }, []);

  useEffect(() => {
    const sec = secRef.current;
    const svg = svgRef.current;
    if (!sec || !svg) return;
    let raf = 0;
    const frame = () => {
      // прогресс прокрутки внутри закреплённой секции: 0 — только вошли,
      // 1 — сейчас уедет. Реверсивно: скролл вверх уменьшает p → цветок закрывается.
      const total = sec.offsetHeight - window.innerHeight;
      const p = total > 0 ? clamp(-sec.getBoundingClientRect().top / total, 0, 1) : 0;

      petals.forEach((pt, idx) => {
        const el = pathRefs.current[idx];
        if (!el) return;
        // послойное раскрытие: внешние лепестки первыми
        const delay = pt.layer * 0.13 + (idx % 4) * 0.015;
        const local = clamp((p - delay) / (0.7 - delay), 0, 1);
        const eased = local * local * (3 - 2 * local);
        el.style.transform = `scaleY(${0.12 + eased * 0.88}) scaleX(${0.45 + eased * 0.55})`;
        el.style.opacity = String(0.25 + eased * 0.75);
      });
      svg.style.transform = `rotate(${p * 22}deg)`;
      if (progRef.current) {
        progRef.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [petals]);

  return (
    <section className="bloom-sec" id="bloom" ref={secRef}>
      <div className="bloom-wrap">
        <div className="flower-hold">
          <svg
            className="flower"
            ref={svgRef}
            viewBox="-110 -110 220 220"
            aria-hidden="true"
          >
            {petals.map((pt, idx) => (
              <g key={idx} transform={`rotate(${pt.rot})`}>
                <path
                  className="petal"
                  d={pt.d}
                  fill={pt.fill}
                  opacity={pt.opacity}
                  ref={(el) => {
                    pathRefs.current[idx] = el;
                  }}
                />
              </g>
            ))}
            <circle r="13" fill="#0d1512" stroke="#5ef2a3" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="bloom-copy">
          <span className="eyebrow">/ Принцип · раскрытие <span ref={progRef}>000</span>%</span>
          <p>
            Хороший продукт раскрывается постепенно — как и доверие. Двигаемся
            шаг за шагом: от первого экрана до работающего релиза.
          </p>
        </div>
      </div>
    </section>
  );
}
