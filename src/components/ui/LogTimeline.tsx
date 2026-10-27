"use client";

import React, { useState, useEffect } from "react";

export interface LogEntry {
  id: string;
  week: string;
  dates: string;
  hours: string;
  status: string;
  tasks: string[];
  images?: string[];
}

interface LogTimelineProps {
  entries: LogEntry[];
}

export default function LogTimeline({ entries }: LogTimelineProps) {
  const [lightbox, setLightbox] = useState<{
    week: string;
    dates: string;
    images: string[];
    index: number;
  } | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLightbox(null);
      } else if (e.key === "ArrowRight") {
        setLightbox((prev) =>
          prev
            ? { ...prev, index: (prev.index + 1) % prev.images.length }
            : null
        );
      } else if (e.key === "ArrowLeft") {
        setLightbox((prev) =>
          prev
            ? {
                ...prev,
                index:
                  (prev.index - 1 + prev.images.length) % prev.images.length,
              }
            : null
        );
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox]);

  return (
    <>
      <div className="relative pl-4 sm:pl-6 border-l border-white/20 flex flex-col gap-6">
        {entries.map((entry, idx) => {
          const isApproved = entry.status.toUpperCase() === "APPROVED";
          const images = entry.images?.filter(Boolean) || [];

          return (
            <article
              key={entry.id || idx}
              className="relative border border-white/15 bg-[#1b1c1e]/65 p-5 sm:p-6 flex flex-col gap-4 hover:border-white/30 transition-colors"
            >
              {/* Timeline Node Marker */}
              <span
                aria-hidden="true"
                className="absolute -left-[21px] sm:-left-[29px] top-6 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#252525]"
              />

              {/* Top Row: Week, Dates, Hours, Status */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2.5 border-b border-white/10 pb-3.5">
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <h3 className="text-[15px] sm:text-[16px] font-orbitron font-bold text-white tracking-wider uppercase">
                    {entry.week}
                  </h3>
                  <span className="text-[11px] text-neutral-400 font-mono tracking-wider">
                    {entry.dates}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <span className="px-2.5 py-1 bg-white/[0.04] border border-white/10 text-[11px] text-neutral-200 font-mono">
                    {entry.hours}
                  </span>
                  <span
                    className={`px-2.5 py-1 border font-mono font-semibold tracking-wider text-[10px] uppercase ${
                      isApproved
                        ? "border-emerald-500/35 bg-emerald-500/15 text-emerald-300"
                        : "border-amber-500/35 bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
              </div>

              {/* Tasks Bullet List in Readable Geist Sans */}
              <ul className="list-none flex flex-col gap-2.5 pl-0">
                {entry.tasks.map((task, taskIdx) => (
                  <li
                    key={taskIdx}
                    className="text-[14px] text-neutral-200 leading-relaxed flex items-start gap-3 font-sans max-w-[72ch]"
                  >
                    <span
                      aria-hidden="true"
                      className="text-emerald-400/80 font-mono text-xs pt-1 select-none shrink-0"
                    >
                      ▸
                    </span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>

              {/* Weekly Photo Documentation Gallery */}
              {images.length > 0 ? (
                <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
                  <span className="text-[10px] font-mono text-neutral-400 tracking-[0.18em] uppercase">
                    PHOTO DOCUMENTATION ({images.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((imgUrl, imgIdx) => (
                      <button
                        key={`${imgUrl}-${imgIdx}`}
                        type="button"
                        onClick={() =>
                          setLightbox({
                            week: entry.week,
                            dates: entry.dates,
                            images,
                            index: imgIdx,
                          })
                        }
                        className="group relative aspect-video border border-white/15 bg-[#121314] overflow-hidden cursor-pointer focus:outline-none focus:border-white"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`${entry.week} documentation ${imgIdx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-end p-2">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 bg-[#18191b]/90 border border-white/20 text-[9px] font-mono text-white uppercase tracking-wider">
                            VIEW
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {/* Lightbox Modal for Weekly Photo Documentation */}
      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${lightbox.week} Photo Documentation`}
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl h-dvh sm:h-[88vh] border-0 sm:border border-white/25 bg-[#1b1c1e] flex flex-col"
          >
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-white/15 px-4 py-3.5 sm:px-6 sm:py-4 bg-[#252525]">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">
                  {lightbox.week} • {lightbox.dates}
                </span>
                <span className="text-[13px] font-orbitron font-bold tracking-wider text-white uppercase">
                  Photo {lightbox.index + 1} of {lightbox.images.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {lightbox.images.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setLightbox({
                          ...lightbox,
                          index:
                            (lightbox.index - 1 + lightbox.images.length) %
                            lightbox.images.length,
                        })
                      }
                      className="min-h-[38px] px-3 py-1.5 border border-white/20 hover:bg-white/10 text-white text-[11px] font-mono uppercase cursor-pointer"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setLightbox({
                          ...lightbox,
                          index: (lightbox.index + 1) % lightbox.images.length,
                        })
                      }
                      className="min-h-[38px] px-3 py-1.5 border border-white/20 hover:bg-white/10 text-white text-[11px] font-mono uppercase cursor-pointer"
                    >
                      Next →
                    </button>
                  </>
                ) : null}
                <a
                  href={lightbox.images[lightbox.index]}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[38px] px-3.5 py-2 border border-white/20 hover:bg-white/10 text-neutral-200 hover:text-white text-[11px] font-mono tracking-wider uppercase inline-flex items-center transition-colors"
                >
                  New Tab ↗
                </a>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="min-h-[38px] px-3.5 py-2 border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-mono font-semibold tracking-wider uppercase inline-flex items-center cursor-pointer transition-colors"
                >
                  Close [ESC]
                </button>
              </div>
            </div>

            {/* Image Viewer Body */}
            <div className="flex-grow bg-[#121314] p-3 sm:p-6 flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightbox.images[lightbox.index]}
                alt={`${lightbox.week} documentation photo ${
                  lightbox.index + 1
                }`}
                className="max-w-full max-h-full object-contain select-none shadow-2xl"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
