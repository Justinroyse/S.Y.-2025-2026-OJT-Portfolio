"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { name: "HOME", path: "/", index: "01" },
  { name: "ABOUT", path: "/about", index: "02" },
  { name: "REQUIREMENTS", path: "/requirements", index: "03" },
  { name: "LOG", path: "/log", index: "04" },
];

export default function NavBar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav
      aria-label="Primary Navigation"
      className="flex items-center justify-between w-full gap-2 overflow-x-auto no-scrollbar"
    >
      <div className="flex items-center gap-x-1 sm:gap-x-4 md:gap-x-8 text-[11px] sm:text-[13px] lg:text-[14px] font-orbitron tracking-[0.14em] sm:tracking-[0.18em] select-none">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={active ? "page" : undefined}
              className={`relative px-2.5 sm:px-2 py-3 min-h-[44px] inline-flex items-center gap-1.5 transition-colors duration-200 uppercase whitespace-nowrap cursor-pointer ${
                active
                  ? "text-white font-bold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <span className="hidden xl:inline text-[10px] font-mono text-neutral-500 font-normal">
                {item.index}
              </span>
              <span>{item.name}</span>
              {active ? (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
              ) : null}
            </Link>
          );
        })}
      </div>

      <Link
        href="/admin"
        prefetch={false}
        aria-current={pathname.startsWith("/admin") ? "page" : undefined}
        className={`text-[10px] tracking-[0.2em] font-mono px-3 py-2 min-h-[36px] inline-flex items-center justify-center border transition-colors duration-200 uppercase whitespace-nowrap shrink-0 cursor-pointer ${
          pathname.startsWith("/admin")
            ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 font-bold"
            : "border-white/15 bg-white/[0.02] hover:border-white/35 text-neutral-400 hover:text-white"
        }`}
        title="Admin CMS Console"
      >
        ADMIN
      </Link>
    </nav>
  );
}
