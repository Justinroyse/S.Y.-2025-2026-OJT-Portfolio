"use client";

import React, { useState } from "react";

interface RequirementItem {
  key: string;
  name: string;
  href: string;
  submissionDate?: string;
}

interface RequirementsListProps {
  requirements: RequirementItem[];
}

export default function RequirementsList({ requirements }: RequirementsListProps) {
  const [activeFileUrl, setActiveFileUrl] = useState<string | null>(null);

  const openViewer = (e: React.MouseEvent, href: string) => {
    if (href === "#") return;
    e.preventDefault();
    setActiveFileUrl(href);
  };

  const closeViewer = () => {
    setActiveFileUrl(null);
  };

  // Improved file type matching
  const isImage = activeFileUrl ? /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(activeFileUrl) : false;
  const isPdf = activeFileUrl ? /\.pdf(\?.*)?$/i.test(activeFileUrl) : false;

  return (
    <>
      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 select-none">
        {requirements.map((req, index) => {
          const docNum = String(index + 1).padStart(2, "0");
          const isUploaded = req.href && req.href !== "#";

          return (
            <a
              key={req.key || index}
              href={req.href}
              onClick={(e) => isUploaded ? openViewer(e, req.href) : e.preventDefault()}
              className={`p-4 border transition-all flex justify-between items-center group cursor-pointer duration-200 ${
                isUploaded
                  ? "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/45"
                  : "border-white/10 bg-neutral-900/10 hover:bg-white/5 hover:border-white/30 active:scale-[0.98]"
              }`}
            >
              <div className="flex items-center gap-4 font-orbitron">
                <span className="text-[11px] font-mono text-neutral-500 tracking-wider">
                  [{docNum}]
                </span>
                <div className="flex flex-col">
                  <span
                    className={`text-[13px] font-semibold transition-colors uppercase tracking-wider ${
                      isUploaded
                        ? "text-emerald-400 group-hover:text-emerald-300"
                        : "text-neutral-300 group-hover:text-white"
                    }`}
                  >
                    {req.name}
                  </span>
                  {req.submissionDate && (
                    <span className="text-[9px] font-mono text-neutral-500 mt-0.5 lowercase">
                      uploaded: {req.submissionDate}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isUploaded && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 tracking-widest uppercase">
                    SYS_FILE
                  </span>
                )}
                <span
                  className={`transition-all text-xs font-mono font-bold ${
                    isUploaded
                      ? "text-emerald-400 group-hover:translate-x-1"
                      : "text-neutral-500 group-hover:text-white group-hover:translate-x-1"
                  }`}
                >
                  &gt;&gt;
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {/* Embedded Document Viewer Modal */}
      {activeFileUrl && (
        <div className="fixed inset-0 z-50 bg-[#151515]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl h-[85vh] border border-white/20 bg-[#1e1e1e] flex flex-col font-orbitron">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-white/10 px-6 py-4 bg-neutral-900/40">
              <div className="flex flex-col">
                <span className="text-[9px] text-neutral-500 font-mono tracking-widest uppercase">
                  SYS_PREVIEW_UTILITY
                </span>
                <span className="text-[13px] font-bold tracking-wider text-white truncate max-w-[250px] sm:max-w-lg">
                  {activeFileUrl.split("/").pop()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={activeFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 border border-white/15 hover:bg-white/5 text-neutral-300 hover:text-white text-[10px] tracking-widest uppercase transition-colors"
                >
                  NEW_TAB
                </a>
                <button
                  onClick={closeViewer}
                  className="px-3 py-1.5 border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-[10px] tracking-widest uppercase cursor-pointer transition-colors"
                >
                  CLOSE [X]
                </button>
              </div>
            </div>

            {/* Modal Body / Embedded File */}
            <div className="flex-grow bg-neutral-950/70 p-2 sm:p-4 flex items-center justify-center overflow-hidden">
              {isPdf ? (
                <iframe
                  src={activeFileUrl}
                  className="w-full h-full border-0"
                  title="PDF Document Viewer"
                />
              ) : isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeFileUrl}
                  alt="Requirement Document"
                  className="max-w-full max-h-full object-contain select-none shadow-2xl"
                />
              ) : (
                <div className="text-center p-6 flex flex-col gap-4 max-w-md">
                  <div className="text-rose-500 font-mono text-lg">[!] NO_PREVIEW_AVAILABLE</div>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                    This file format does not support inline rendering. Use the button above to open or download the file.
                  </p>
                  <a
                    href={activeFileUrl}
                    download
                    className="self-center px-6 py-2 bg-[#d9d9d9] hover:bg-white text-[#252525] font-bold text-xs tracking-widest uppercase transition-all"
                  >
                    DOWNLOAD_FILE
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
