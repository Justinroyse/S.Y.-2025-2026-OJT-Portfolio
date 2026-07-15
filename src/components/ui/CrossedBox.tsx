import React from "react";

interface CrossedBoxProps {
  logoUrl?: string;
}

export default function CrossedBox({ logoUrl }: CrossedBoxProps) {
  return (
    <div className="relative w-[200px] h-[200px] border border-white bg-transparent flex items-center justify-center group overflow-hidden select-none">
      {/* Diagnostic Cross Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="0"
          y1="0"
          x2="100%"
          y2="100%"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
        />
        <line
          x1="100%"
          y1="0"
          x2="0"
          y2="100%"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
        />
      </svg>

      {/* Cyberpunk Technical Markings */}
      <div className="absolute top-2 left-2 text-[9px] font-mono text-white/30 tracking-widest uppercase select-none">
        HTE_SEAL
      </div>
      <div className="absolute bottom-2 right-2 text-[9px] font-mono text-white/30 tracking-widest uppercase select-none">
        200_X_200
      </div>

      <div className="w-full h-full p-2 flex items-center justify-center z-10">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="HTE Logo"
            className="max-w-[85%] max-h-[85%] object-contain select-none transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="text-center p-4 transition-opacity duration-300 opacity-60 group-hover:opacity-100">
            <p className="text-[10px] font-orbitron tracking-widest text-neutral-400">
              HTE LOGO
            </p>
            <p className="text-[8px] font-mono text-neutral-500 tracking-wider mt-1">
              [PLACEHOLDER]
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
