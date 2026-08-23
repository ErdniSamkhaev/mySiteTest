import { useEffect, useRef } from "react";

/**
 * Запускает cb каждый кадр, пока enabled. Хранит cb в ref, поэтому
 * пересоздание функции при рендере не перезапускает цикл (нет дёрганья).
 */
export function useAnimationFrame(
  cb: (now: number) => void,
  enabled = true,
): void {
  const ref = useRef(cb);
  ref.current = cb;

  useEffect(() => {
    if (!enabled) return;
    let id = 0;
    const loop = (now: number) => {
      ref.current(now);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [enabled]);
}
