"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const OPTIONS = [
  { name: "HOME", path: "/", code: "SEC-01" },
  { name: "ABOUT", path: "/about", code: "SEC-02" },
  { name: "REQUIREMENTS", path: "/requirements", code: "SEC-03" },
  { name: "LOG", path: "/log", code: "SEC-04" },
];

export default function DropdownSelector() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getCurrentOption = () => {
    if (pathname === "/") return OPTIONS[0];
    if (pathname.startsWith("/about")) return OPTIONS[1];
    if (pathname.startsWith("/requirements")) return OPTIONS[2];
    if (pathname.startsWith("/log")) return OPTIONS[3];
    if (pathname.startsWith("/admin"))
      return { name: "ADMIN", path: "/admin", code: "CMS-00" };
    return OPTIONS[0];
  };

  const currentOption = getCurrentOption();

  const handleSelect = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative font-orbitron w-[165px] sm:w-[195px] shrink-0 z-40"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Jump to section, current section ${currentOption.name}`}
        className="w-full min-h-[38px] lg:min-h-[36px] bg-[#e4e4e7] text-[#18191b] px-3.5 flex items-center justify-between text-[12px] sm:text-[13px] uppercase tracking-widest transition-colors hover:bg-white active:scale-[0.99] cursor-pointer"
      >
        <span className="font-bold truncate">{currentOption.name}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="hidden sm:inline text-[9px] font-mono text-neutral-600 font-semibold">
            {currentOption.code}
          </span>
          <svg
            className={`w-3.5 h-3.5 text-[#18191b] transition-transform duration-150 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M8 9l4-4 4 4m0 6l-4 4-4-4"
            />
          </svg>
        </div>
      </button>

      {isOpen ? (
        <div
          role="listbox"
          className="absolute top-[calc(100%+4px)] right-0 lg:left-0 w-full bg-[#1b1c1e] border border-white/25 shadow-2xl overflow-hidden z-50"
        >
          {OPTIONS.map((option) => {
            const active = option.path === currentOption.path;
            return (
              <button
                key={option.path}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => handleSelect(option.path)}
                className={`w-full min-h-[42px] text-left px-3.5 py-2.5 text-[11px] sm:text-[12px] tracking-wider uppercase flex items-center justify-between transition-colors hover:bg-white/10 cursor-pointer ${
                  active
                    ? "text-white font-bold bg-white/8"
                    : "text-neutral-300"
                }`}
              >
                <span>{option.name}</span>
                <span className="text-[9px] font-mono text-neutral-500">
                  {option.code}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
