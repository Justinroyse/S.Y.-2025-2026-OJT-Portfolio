"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const navItems = [
    { name: "HOME", path: "/" },
    { name: "ABOUT", path: "/about" },
    { name: "REQUIREMENTS", path: "/requirements" },
    { name: "LOG", path: "/log" },
  ];

  // Determine active route
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav className="flex items-center gap-x-12 text-[16px] font-normal tracking-[0.2em] font-orbitron select-none">
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`relative py-2 transition-all duration-300 uppercase cursor-pointer ${
              active
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <span>{item.name}</span>
            {/* Cyberpunk active underline indicator */}
            {active && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-in fade-in zoom-in-50 duration-300" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}