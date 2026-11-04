"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type Slide = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string | null;
  desktop: string;
  mobile: string | null;
  theme: "light" | "dark";
};

const INTERVAL = 6500;

export function BannerSlider({ slides, labels }: { slides: Slide[]; labels: { prev: string; next: string; slide: string } }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setTimeout(() => go(index + 1), INTERVAL);
    return () => window.clearTimeout(id);
  }, [index, paused, count, go]);

  if (!count) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={labels.slide}
      className="relative overflow-hidden bg-paper-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div className="relative aspect-[4/5] sm:aspect-[2/1] lg:aspect-[3/1]">
        {slides.map((s, i) => {
          const visible = i === index;
          const light = s.theme === "light";
          const body = (
            <>
              <picture>
                {s.mobile && <source media="(max-width: 639px)" srcSet={s.mobile} />}
                <img
                  src={s.desktop}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-[right_center]"
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  decoding="async"
                />
              </picture>
              {(s.title || s.subtitle || s.cta) && (
                <div
                  className={`absolute inset-x-0 bottom-0 p-6 sm:inset-y-0 sm:right-auto sm:flex sm:w-[44%] sm:flex-col sm:justify-center sm:p-12 lg:p-16 ${
                    light ? "text-paper" : "text-ink"
                  }`}
                >
                  {s.title && <h2 className="display text-5xl sm:text-5xl lg:text-6xl xl:text-7xl">{s.title}</h2>}
                  {s.subtitle && <p className={`mt-3 max-w-md text-lg sm:text-xl ${light ? "text-paper/80" : "text-ink-2"}`}>{s.subtitle}</p>}
                  {s.cta && s.href && (
                    <span
                      className={`label mt-6 inline-flex h-11 w-fit items-center gap-2 px-5 ${
                        light ? "bg-paper text-ink" : "bg-ink text-paper"
                      }`}
                    >
                      {s.cta} <span aria-hidden>→</span>
                    </span>
                  )}
                </div>
              )}
            </>
          );
          return (
            <div
              key={s.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${count}`}
              aria-hidden={!visible}
              inert={!visible}
              className={`absolute inset-0 transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
            >
              {s.href ? (
                <Link href={s.href} className="block h-full w-full" tabIndex={visible ? 0 : -1}>
                  {body}
                </Link>
              ) : (
                body
              )}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className="pointer-events-none absolute inset-x-0 top-3 flex items-center justify-end gap-3 px-3 sm:top-auto sm:bottom-6 sm:px-8">
          <div className="pointer-events-auto flex items-center gap-2 bg-paper/90 px-2 py-1 backdrop-blur">
            <button type="button" onClick={() => go(index - 1)} aria-label={labels.prev} className="flex h-9 w-9 items-center justify-center hover:bg-paper-2">
              <span aria-hidden>←</span>
            </button>
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`${labels.slide} ${i + 1}`}
                aria-current={i === index}
                className="flex h-9 w-6 items-center justify-center"
              >
                <span className={`block h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-ink" : "w-1.5 bg-ink/30"}`} />
              </button>
            ))}
            <button type="button" onClick={() => go(index + 1)} aria-label={labels.next} className="flex h-9 w-9 items-center justify-center hover:bg-paper-2">
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
