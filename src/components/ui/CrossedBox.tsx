import React from "react";

interface CrossedBoxProps {
  logoUrl?: string;
  establishmentName?: string;
}

export default function CrossedBox({
  logoUrl,
  establishmentName,
}: CrossedBoxProps) {
  return (
    <div className="relative w-[170px] h-[170px] sm:w-[190px] sm:h-[190px] lg:w-[210px] lg:h-[210px] border border-white/40 bg-[#1b1c1e]/80 flex items-center justify-center group overflow-hidden select-none shrink-0">
      {/* Diagnostic Blueprint Crosshair Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <line
          x1="0"
          y1="0"
          x2="100%"
          y2="100%"
          stroke="rgba(255, 255, 255, 0.14)"
          strokeWidth="1"
        />
        <line
          x1="100%"
          y1="0"
          x2="0"
          y2="100%"
          stroke="rgba(255, 255, 255, 0.14)"
          strokeWidth="1"
        />
      </svg>

      {/* Corner Registration Marks */}
      <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white/70 pointer-events-none" />
      <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-white/70 pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-white/70 pointer-events-none" />
      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-white/70 pointer-events-none" />

      {/* Technical Frame Coordinates */}
      <div className="absolute top-2 left-2.5 text-[9px] font-mono text-neutral-400 tracking-widest uppercase">
        HTE_SEAL
      </div>
      <div className="absolute bottom-2 right-2.5 text-[9px] font-mono text-neutral-500 tracking-widest uppercase">
        FIG.01
      </div>

      <div className="w-full h-full flex items-center justify-center z-10 p-5">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={
              establishmentName
                ? `${establishmentName} Official Seal`
                : "Host Training Establishment Logo"
            }
            className="max-w-full max-h-full object-contain select-none transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="text-center px-3 py-2 border border-white/10 bg-[#252525]/90">
            <p className="text-[11px] font-orbitron font-bold tracking-widest text-white uppercase">
              HTE INSIGNIA
            </p>
            <p className="text-[9px] font-mono text-neutral-400 tracking-wider mt-1 uppercase">
              {establishmentName ? establishmentName.slice(0, 18) : "PENDING SEAL"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
