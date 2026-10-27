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

  // Helper to check active state
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav className="flex items-center justify-between w-full">
      <div className="flex items-center gap-x-6 md:gap-x-10 text-[13px] md:text-[15px] font-normal tracking-[0.2em] font-orbitron select-none">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`relative py-1.5 transition-all duration-300 uppercase cursor-pointer ${
                active ? "text-white font-bold" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <span>{item.name}</span>
              {active && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-in fade-in duration-300" />
              )}
            </Link>
          );
        })}
      </div>

      <Link
        href="/admin"
        prefetch={false}
        className={`text-[10px] tracking-[0.25em] font-mono px-2.5 py-1 border transition-all duration-200 uppercase cursor-pointer ${
          pathname.startsWith("/admin")
            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-bold"
            : "border-white/10 hover:border-white/30 text-neutral-500 hover:text-white"
        }`}
        title="Admin CMS Dashboard"
      >
        [ADMIN]
      </Link>
    </nav>
  );
}
