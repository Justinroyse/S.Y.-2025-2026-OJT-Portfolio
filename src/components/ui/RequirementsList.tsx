"use client";

import React, { useState, useEffect } from "react";

interface RequirementItem {
  key: string;
  name: string;
  href: string;
  submissionDate?: string;
}

interface RequirementsListProps {
  requirements: RequirementItem[];
}

type FilterMode = "all" | "submitted" | "pending";

/**
 * Route any file URL through our inline document viewer API so browsers
 * render PDFs and images live on-screen instead of forcing an attachment download.
 */
function getInlineViewUrl(url: string): string {
  if (!url || url === "#") return "#";
  if (url.startsWith("/api/view/")) return url;

  if (
    url.includes("raw.githubusercontent.com") ||
    url.startsWith("/uploads/")
  ) {
    const filename = url.split("/").pop();
    if (filename) return `/api/view/${filename}`;
  }

  return url;
}

export default function RequirementsList({
  requirements,
}: RequirementsListProps) {
  const [activeFile, setActiveFile] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");

  const submittedCount = requirements.filter(
    (r) => Boolean(r.href && r.href !== "#")
  ).length;
  const pendingCount = requirements.length - submittedCount;
  const completionPercent =
    requirements.length > 0
      ? Math.round((submittedCount / requirements.length) * 100)
      : 0;

  const filteredRequirements = requirements.filter((req) => {
    const isUploaded = Boolean(req.href && req.href !== "#");
    if (filter === "submitted") return isUploaded;
    if (filter === "pending") return !isUploaded;
    return true;
  });

  useEffect(() => {
    if (!activeFile) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveFile(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFile]);

  const openViewer = (
    e: React.MouseEvent,
    name: string,
    href: string
  ) => {
    if (!href || href === "#") return;
    e.preventDefault();
    const inlineUrl = getInlineViewUrl(href);
    setActiveFile({ name, url: inlineUrl });
  };

  const closeViewer = () => {
    setActiveFile(null);
  };

  const isImage = activeFile
    ? /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(activeFile.url)
    : false;
  const isPdf = activeFile
    ? /\.pdf(\?.*)?$/i.test(activeFile.url) ||
      activeFile.url.includes("/api/view/")
    : false;

  return (
    <div className="flex flex-col gap-6">
      {/* Compliance Summary & Filter Controls */}
      <div className="border border-white/15 bg-[#1b1c1e]/75 p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-neutral-400 tracking-[0.2em] uppercase">
              SUBMISSION PROGRESS
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-[18px] sm:text-[20px] font-orbitron font-bold text-white">
                {submittedCount} of {requirements.length}
              </span>
              <span className="text-[12px] font-mono text-neutral-400">
                documents filed ({completionPercent}%)
              </span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter requirements by status"
            className="flex flex-wrap items-center gap-2"
          >
            {(
              [
                { id: "all", label: `All (${requirements.length})` },
                { id: "submitted", label: `Submitted (${submittedCount})` },
                { id: "pending", label: `Pending (${pendingCount})` },
              ] as const
            ).map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(tab.id)}
                  className={`min-h-[38px] px-3.5 py-1.5 text-[11px] font-mono tracking-wider uppercase border transition-colors cursor-pointer ${
                    active
                      ? "border-white bg-white text-[#18191b] font-bold"
                      : "border-white/15 bg-[#252525]/60 text-neutral-300 hover:border-white/35 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="w-full h-1.5 bg-white/10 overflow-hidden"
          role="progressbar"
          aria-valuenow={submittedCount}
          aria-valuemin={0}
          aria-valuemax={requirements.length}
          aria-label="Deliverables completion progress"
        >
          <div
            className="h-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Requirements Grid (Natural Page Flow - No Nested Scroll Trap) */}
      {filteredRequirements.length === 0 ? (
        <div className="border border-white/15 bg-[#1b1c1e]/40 p-8 text-center flex flex-col items-center gap-3">
          <p className="text-[14px] text-neutral-300">
            No requirements match the selected filter.
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="min-h-[38px] px-4 py-1.5 border border-white/20 text-[11px] font-mono uppercase tracking-wider text-white hover:bg-white/10 cursor-pointer"
          >
            Show All Deliverables
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredRequirements.map((req) => {
            const originalIndex = requirements.findIndex(
              (r) => r.key === req.key
            );
            const docNum = String(
              (originalIndex >= 0 ? originalIndex : 0) + 1
            ).padStart(2, "0");
            const isUploaded = Boolean(req.href && req.href !== "#");
            const viewUrl = isUploaded ? getInlineViewUrl(req.href) : "#";

            if (isUploaded) {
              return (
                <a
                  key={req.key}
                  href={viewUrl}
                  onClick={(e) => openViewer(e, req.name, req.href)}
                  className="min-h-[72px] p-4 sm:p-5 border border-emerald-500/35 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.12] hover:border-emerald-400/60 transition-colors flex justify-between items-center gap-4 group cursor-pointer"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span className="text-[11px] font-mono text-emerald-400/80 tracking-wider pt-0.5 shrink-0">
                      {docNum}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[14px] font-orbitron font-bold text-white group-hover:text-emerald-300 transition-colors uppercase tracking-wide break-words">
                        {req.name}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-300/80 mt-1">
                        {req.submissionDate
                          ? `Filed ${req.submissionDate}`
                          : "Document attached"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-1 border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 font-semibold tracking-wider uppercase">
                      VIEW FILE
                    </span>
                  </div>
                </a>
              );
            }

            return (
              <div
                key={req.key}
                className="min-h-[72px] p-4 sm:p-5 border border-white/12 bg-[#1b1c1e]/45 flex justify-between items-center gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <span className="text-[11px] font-mono text-neutral-500 tracking-wider pt-0.5 shrink-0">
                    {docNum}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[14px] font-orbitron font-semibold text-neutral-200 uppercase tracking-wide break-words">
                      {req.name}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500 mt-1">
                      Awaiting document attachment
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-1 border border-white/10 bg-white/[0.03] text-neutral-400 tracking-wider uppercase shrink-0">
                  PENDING
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Embedded Document Viewer Modal */}
      {activeFile ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Previewing ${activeFile.name}`}
          onClick={closeViewer}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl h-dvh sm:h-[88vh] border-0 sm:border border-white/25 bg-[#1b1c1e] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-white/15 px-4 py-3.5 sm:px-6 sm:py-4 bg-[#252525]">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">
                  DOCUMENT PREVIEW
                </span>
                <span className="text-[14px] font-orbitron font-bold tracking-wider text-white truncate max-w-[220px] sm:max-w-lg uppercase">
                  {activeFile.name}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <a
                  href={activeFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[38px] px-3.5 py-2 border border-white/20 hover:bg-white/10 text-neutral-200 hover:text-white text-[11px] font-mono tracking-wider uppercase inline-flex items-center transition-colors"
                >
                  Open in New Tab ↗
                </a>
                <button
                  type="button"
                  onClick={closeViewer}
                  className="min-h-[38px] px-3.5 py-2 border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-mono font-semibold tracking-wider uppercase inline-flex items-center cursor-pointer transition-colors"
                >
                  Close [ESC]
                </button>
              </div>
            </div>

            {/* Modal Body / Embedded File */}
            <div className="flex-grow bg-[#121314] p-2 sm:p-4 flex items-center justify-center overflow-hidden">
              {isPdf ? (
                <object
                  data={activeFile.url}
                  type="application/pdf"
                  className="w-full h-full border-0"
                >
                  <iframe
                    src={activeFile.url}
                    className="w-full h-full border-0"
                    title={`${activeFile.name} PDF Viewer`}
                  />
                </object>
              ) : isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeFile.url}
                  alt={activeFile.name}
                  className="max-w-full max-h-full object-contain select-none shadow-2xl"
                />
              ) : (
                <div className="text-center p-6 flex flex-col gap-4 max-w-md">
                  <div className="text-amber-400 font-orbitron font-bold text-base uppercase tracking-wider">
                    Inline Preview Unavailable
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                    This file format cannot be rendered directly inside the
                    browser window. Download the document or open it in a new
                    tab to view its contents.
                  </p>
                  <a
                    href={activeFile.url}
                    download
                    className="min-h-[42px] self-center px-6 py-2.5 bg-[#e4e4e7] hover:bg-white text-[#18191b] font-orbitron font-bold text-xs tracking-widest uppercase inline-flex items-center transition-colors"
                  >
                    Download Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
