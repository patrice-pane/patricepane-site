"use client";

import { useEffect, useState } from "react";

// Burger button + overlay on mobile; on desktop the wrappers are `display: contents`
// and the menu renders inline. Switched in CSS so the server HTML is right from the first paint.
export default function MobileMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        className="hidden max-md:flex flex-col w-5 h-5 m-2.5 p-0 justify-center items-center cursor-pointer"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span className="w-5 h-0.5 m-0.5 border-b-[1.5px] border-black" />
        <span className="w-5 h-0.5 m-0.5 border-b-[1.5px] border-black" />
        <span className="w-5 h-0.5 m-0.5 border-b-[1.5px] border-black" />
      </button>
      <div
        className={`contents max-md:block max-md:fixed max-md:inset-0 max-md:z-10 ${
          open ? "max-md:visible" : "max-md:invisible max-md:transition-[visibility] max-md:duration-0 max-md:delay-300"
        }`}
        onClick={() => setOpen(false)}
      >
        <div className="contents max-md:block max-md:bg-white max-md:border-b max-md:border-black max-md:pb-[15px]">
          {children}
        </div>
        <div
          className={`hidden max-md:block h-full bg-[grey] transition-opacity duration-300 ease-in-out ${
            open ? "opacity-40" : "opacity-0"
          }`}
        />
      </div>
    </>
  );
}
