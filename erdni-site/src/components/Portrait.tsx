import { useEffect, useRef } from "react";
import { clamp } from "../lib/env";

/**
 * Портрет в «мониторной» обработке: фото прогоняется через Bayer-дизеринг
 * в зелёный фосфор (ink → signal). Файл — /images/me2.webp (замените на свой).
 */
export default function Portrait() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const W = canvas.width;
      const H = canvas.height;
      const ir = img.width / img.height;
      const cr = W / H;
      let sw: number, sh: number, sx: number, sy: number;
      if (ir > cr) {
        sh = img.height;
        sw = sh * cr;
        sx = (img.width - sw) / 2;
        sy = 0;
      } else {
        sw = img.width;
        sh = sw / cr;
        sx = 0;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);

      const data = ctx.getImageData(0, 0, W, H);
      const d = data.data;
      const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
        (v) => v / 16 - 0.5,
      );
      const ink = [13, 21, 18];
      const sig = [94, 242, 163];
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          let g = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
          g = Math.pow(g, 0.9);
          const thr = bayer[(y & 3) * 4 + (x & 3)] * 0.5;
          const level = clamp(g + thr, 0, 1);
          const q = Math.round(level * 3) / 3;
          d[i] = ink[0] + (sig[0] - ink[0]) * q;
          d[i + 1] = ink[1] + (sig[1] - ink[1]) * q;
          d[i + 2] = ink[2] + (sig[2] - ink[2]) * q;
        }
      }
      ctx.putImageData(data, 0, 0);
    };
    img.onerror = () => {
      ctx.fillStyle = "#0d1512";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#2f7a56";
      ctx.font = "14px monospace";
      ctx.fillText("// нет фото", 20, 30);
    };
    img.src = "/images/me2.webp";
  }, []);

  return (
    <div className="portrait" data-fade="1">
      <canvas ref={ref} width={480} height={600} />
      <span className="cap">REC · Эрдни</span>
    </div>
  );
}
