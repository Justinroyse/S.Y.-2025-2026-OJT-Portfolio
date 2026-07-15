"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function DropdownSelector() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { name: "HOME", path: "/" },
    { name: "ABOUT", path: "/about" },
    { name: "REQUIREMENTS", path: "/requirements" },
    { name: "LOG", path: "/log" },
  ];

  // Map sub-paths to active options
  const getCurrentOption = () => {
    if (pathname === "/") return options[0];
    if (pathname.startsWith("/about")) return options[1];
    if (pathname.startsWith("/requirements")) return options[2];
    if (pathname.startsWith("/log")) return options[3];
    return options[0];
  };

  const currentOption = getCurrentOption();

  const handleSelect = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative font-orbitron w-[195px] z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[30px] bg-[#d9d9d9] text-[#252525] px-4 flex items-center justify-between font-normal text-[14px] uppercase tracking-widest transition-all hover:bg-white active:scale-[0.98] cursor-pointer"
      >
        <span className="font-bold">{currentOption.name}</span>
        <div className="flex flex-col items-center justify-center">
          {/* Double Chevron up and down */}
          <svg
            className="w-3 h-3 text-[#252525]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M8 9l4-4 4 4m0 6l-4 4-4-4"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-[35px] left-0 w-full bg-[#1e1e1e] border border-white/20 rounded-none overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          {options.map((option) => (
            <button
              key={option.path}
              onClick={() => handleSelect(option.path)}
              className={`w-full text-left px-4 py-2.5 text-[12px] tracking-wider uppercase transition-colors hover:bg-white/10 cursor-pointer ${
                option.path === currentOption.path ? "text-white font-bold bg-white/5" : "text-neutral-400"
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
